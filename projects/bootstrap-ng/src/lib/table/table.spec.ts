import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  BsTable,
  BsTableCell,
  BsTableColumn,
  BsTableDetail,
  BsTableEmpty,
  BsTableSelection,
  BsTableSort,
  BsTableStacked,
} from './table';

interface Person {
  id: number;
  name: string;
  age: number | null;
  joined: Date;
}

const PEOPLE: Person[] = [
  { id: 1, name: 'Carol', age: 41, joined: new Date(2021, 0, 1) },
  { id: 2, name: 'alice', age: 29, joined: new Date(2019, 0, 1) },
  { id: 3, name: 'Bob', age: null, joined: new Date(2023, 0, 1) },
  { id: 4, name: 'Dave', age: 35, joined: new Date(2020, 0, 1) },
  { id: 5, name: 'Eve', age: 22, joined: new Date(2022, 0, 1) },
];

function columns(): BsTableColumn<Person>[] {
  return [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'age', header: 'Age', sortable: true, align: 'end' },
    {
      key: 'joined',
      header: 'Joined',
      sortable: true,
      format: (value) => (value as Date).getFullYear().toString(),
    },
  ];
}

@Component({
  imports: [BsTable],
  template: `
    <table
      bsTable
      class="mb-0"
      [data]="data()"
      [(columns)]="columns"
      [(sort)]="sort"
      [(page)]="page"
      [(selected)]="selected"
      [rowKey]="rowKey"
      [filter]="filter()"
      [pageSize]="pageSize()"
      [selection]="selection()"
      [loading]="loading()"
      [manual]="manual()"
      [total]="total()"
      [striped]="striped()"
      [stacked]="stacked()"
      [resizable]="resizable()"
      [reorderable]="reorderable()"
      stickyHeader
      hover
      bordered
      size="sm"
      theme="primary">
      <caption>
        People
      </caption>
    </table>
  `,
})
class Host {
  readonly data = signal(PEOPLE);
  readonly columns = signal(columns());
  readonly sort = signal<BsTableSort | null>(null);
  readonly page = signal(1);
  readonly selected = signal<Person[]>([]);
  readonly filter = signal('');
  readonly pageSize = signal(0);
  readonly selection = signal<BsTableSelection>('none');
  readonly loading = signal(false);
  readonly manual = signal(false);
  readonly total = signal<number | null>(null);
  readonly striped = signal(false);
  readonly stacked = signal<BsTableStacked | null>(null);
  readonly resizable = signal(false);
  readonly reorderable = signal(false);
  readonly rowKey = (row: Person) => row.id;
}

describe('BsTable', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const table: HTMLTableElement = fixture.nativeElement.querySelector('table');
    const host = fixture.componentInstance;
    const names = () =>
      Array.from(table.querySelectorAll('tbody tr')).map((tr) =>
        tr.querySelectorAll('td')[host.selection() === 'none' ? 0 : 1]?.textContent.trim(),
      );
    const headers = () =>
      Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim());
    return { fixture, host, table, names, headers };
  }

  it('renders headers, cells and Bootstrap classes', async () => {
    const { table, names, headers } = await setup();
    expect(Array.from(table.classList).sort()).toEqual([
      'mb-0',
      'table',
      'table-bordered',
      'table-hover',
      'table-sm',
      'theme-primary',
    ]);
    expect(table.querySelector('caption')!.textContent.trim()).toBe('People');
    expect(table.querySelector('thead')!.classList).toContain('sticky-top');
    expect(headers()).toEqual(['Name', 'Age', 'Joined']);
    expect(names()).toEqual(['Carol', 'alice', 'Bob', 'Dave', 'Eve']);
    const cells = table.querySelectorAll('tbody tr:first-child td');
    expect(cells[1].className).toBe('text-end');
    expect(cells[1].getAttribute('data-cell')).toBe('Age');
    expect(cells[2].textContent.trim()).toBe('2021');
    expect(table.querySelector('tbody tr:nth-child(3) td:nth-child(2)')!.textContent.trim()).toBe(
      '',
    );
  });

  it('sorts ascending, descending and back on header clicks', async () => {
    const { fixture, host, table, names } = await setup();
    host.page.set(2);
    await fixture.whenStable();
    const button = table.querySelector<HTMLButtonElement>('th button')!;
    const th = button.closest('th')!;
    expect(th.hasAttribute('aria-sort')).toBe(false);

    button.click();
    await fixture.whenStable();
    expect(host.sort()).toEqual({ key: 'name', direction: 'asc' });
    expect(host.page()).toBe(1);
    expect(th.getAttribute('aria-sort')).toBe('ascending');
    expect(names()).toEqual(['alice', 'Bob', 'Carol', 'Dave', 'Eve']);

    button.click();
    await fixture.whenStable();
    expect(th.getAttribute('aria-sort')).toBe('descending');
    expect(names()).toEqual(['Eve', 'Dave', 'Carol', 'Bob', 'alice']);

    button.click();
    await fixture.whenStable();
    expect(host.sort()).toBeNull();
    expect(names()).toEqual(['Carol', 'alice', 'Bob', 'Dave', 'Eve']);
  });

  it('sorts numbers and dates, with empty values last', async () => {
    const { fixture, host, names } = await setup();
    host.sort.set({ key: 'age', direction: 'asc' });
    await fixture.whenStable();
    expect(names()).toEqual(['Eve', 'alice', 'Dave', 'Carol', 'Bob']);
    host.sort.set({ key: 'age', direction: 'desc' });
    await fixture.whenStable();
    expect(names()).toEqual(['Carol', 'Dave', 'alice', 'Eve', 'Bob']);
    host.sort.set({ key: 'joined', direction: 'asc' });
    await fixture.whenStable();
    expect(names()).toEqual(['alice', 'Dave', 'Carol', 'Eve', 'Bob']);
    host.sort.set({ key: 'missing', direction: 'asc' });
    await fixture.whenStable();
    expect(names()).toEqual(['Carol', 'alice', 'Bob', 'Dave', 'Eve']);
  });

  it('uses a column compare function', async () => {
    const { fixture, host, names } = await setup();
    host.columns.update((cols) => [
      { ...cols[0], compare: (a: Person, b: Person) => a.name.length - b.name.length },
      ...cols.slice(1),
    ]);
    host.sort.set({ key: 'name', direction: 'asc' });
    await fixture.whenStable();
    expect(names()).toEqual(['Bob', 'Eve', 'Dave', 'Carol', 'alice']);
  });

  it('sorts booleans and strings', async () => {
    const { fixture, host, names } = await setup();
    host.columns.update((cols) => [
      ...cols,
      { key: 'even', header: 'Even', value: (row: Person) => row.id % 2 === 0 },
      { key: 'label', header: 'Label', value: (row: Person) => `item ${String(10 - row.id)}` },
    ]);
    host.sort.set({ key: 'even', direction: 'asc' });
    await fixture.whenStable();
    expect(names()).toEqual(['Carol', 'Bob', 'Eve', 'alice', 'Dave']);
    host.sort.set({ key: 'label', direction: 'asc' });
    await fixture.whenStable();
    expect(names()).toEqual(['Eve', 'Dave', 'Bob', 'alice', 'Carol']);
  });

  it('filters by the text of visible, filterable columns', async () => {
    const { fixture, host, names, table } = await setup();
    host.filter.set(' AL ');
    await fixture.whenStable();
    expect(names()).toEqual(['alice']);
    host.filter.set('2022');
    await fixture.whenStable();
    expect(names()).toEqual(['Eve']);
    host.columns.update((cols) => cols.map((c) => ({ ...c, filterable: c.key !== 'joined' })));
    await fixture.whenStable();
    expect(table.querySelector('tbody td')!.textContent.trim()).toBe('No results');
    expect(table.querySelector('tbody td')!.getAttribute('colspan')).toBe('3');
  });

  it('pages the rows and clamps the page', async () => {
    const { fixture, host, table, names } = await setup();
    const instance = fixture.debugElement.query(By.directive(BsTable))
      .componentInstance as BsTable<Person>;
    host.pageSize.set(2);
    await fixture.whenStable();
    expect(instance.pageCount()).toBe(3);
    expect(names()).toEqual(['Carol', 'alice']);
    host.page.set(3);
    await fixture.whenStable();
    expect(names()).toEqual(['Eve']);
    host.filter.set('a');
    await fixture.whenStable();
    expect(instance.totalRows()).toBe(3);
    expect(instance.currentPage()).toBe(2);
    expect(names()).toEqual(['Dave']);
    expect(table.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('shows data as is in manual mode', async () => {
    const { fixture, host, names } = await setup();
    const instance = fixture.debugElement.query(By.directive(BsTable))
      .componentInstance as BsTable<Person>;
    host.manual.set(true);
    host.pageSize.set(2);
    host.filter.set('zzz');
    host.sort.set({ key: 'name', direction: 'asc' });
    await fixture.whenStable();
    expect(names()).toEqual(['Carol', 'alice', 'Bob', 'Dave', 'Eve']);
    expect(instance.pageCount()).toBe(3);
    host.total.set(40);
    await fixture.whenStable();
    expect(instance.pageCount()).toBe(20);
  });

  it('selects many rows with checkboxes', async () => {
    const { fixture, host, table, headers } = await setup();
    host.selection.set('multiple');
    host.pageSize.set(2);
    await fixture.whenStable();
    expect(headers().length).toBe(4);
    const all = table.querySelector<HTMLInputElement>('thead input[type=checkbox]')!;
    expect(all.className).toBe('check');
    expect(all.getAttribute('aria-label')).toBe('Select all rows');
    const boxes = () => table.querySelectorAll<HTMLInputElement>('tbody input[type=checkbox]');
    expect(boxes()[0].getAttribute('aria-label')).toBe('Carol');

    boxes()[1].click();
    await fixture.whenStable();
    expect(host.selected().map((p) => p.id)).toEqual([2]);
    expect(all.indeterminate).toBe(true);
    expect(table.querySelectorAll('tbody tr')[1].classList).toContain('table-active');

    all.click();
    await fixture.whenStable();
    expect(host.selected().map((p) => p.id)).toEqual([2, 1]);
    expect(all.checked).toBe(true);
    expect(all.indeterminate).toBe(false);

    host.page.set(2);
    await fixture.whenStable();
    expect(all.checked).toBe(false);
    all.click();
    await fixture.whenStable();
    expect(host.selected().map((p) => p.id)).toEqual([2, 1, 3, 4]);
    all.click();
    await fixture.whenStable();
    expect(host.selected().map((p) => p.id)).toEqual([2, 1]);

    host.page.set(1);
    await fixture.whenStable();
    boxes()[0].click();
    await fixture.whenStable();
    expect(host.selected().map((p) => p.id)).toEqual([2]);
  });

  it('selects one row with radios', async () => {
    const { fixture, host, table } = await setup();
    host.selection.set('single');
    await fixture.whenStable();
    expect(table.querySelector('thead th .visually-hidden')!.textContent).toBe('Select');
    const radios = table.querySelectorAll<HTMLInputElement>('tbody input[type=radio]');
    expect(radios[0].className).toBe('radio');
    expect(radios[0].name).toBe(radios[1].name);
    radios[0].click();
    await fixture.whenStable();
    radios[2].click();
    await fixture.whenStable();
    expect(host.selected().map((p) => p.id)).toEqual([3]);
    expect(radios[2].checked).toBe(true);
    const instance = fixture.debugElement.query(By.directive(BsTable))
      .componentInstance as BsTable<Person>;
    instance.select(PEOPLE[2]);
    expect(host.selected().length).toBe(1);
  });

  it('shows a loading row', async () => {
    const { fixture, host, table } = await setup();
    host.loading.set(true);
    await fixture.whenStable();
    expect(table.getAttribute('aria-busy')).toBe('true');
    const cells = table.querySelectorAll('tbody td');
    expect(cells.length).toBe(1);
    expect(cells[0].textContent.trim()).toBe('Loading…');
    expect(cells[0].querySelector('.spinner-border')).not.toBeNull();
  });

  it('hides columns', async () => {
    const { fixture, host, headers } = await setup();
    host.columns.update((cols) => cols.map((c) => ({ ...c, hidden: c.key === 'age' })));
    await fixture.whenStable();
    expect(headers()).toEqual(['Name', 'Joined']);
  });

  it('sets variant and stacked classes', async () => {
    const { fixture, host, table } = await setup();
    host.striped.set(true);
    host.stacked.set('md');
    await fixture.whenStable();
    expect(table.classList).toContain('table-striped');
    expect(table.classList).toContain('md:table-stacked');
    host.stacked.set('always');
    await fixture.whenStable();
    expect(table.classList).toContain('table-stacked');
  });

  it('resizes columns with the keyboard and the pointer', async () => {
    const { fixture, host, table } = await setup();
    host.resizable.set(true);
    host.columns.update((cols) => cols.map((c) => ({ ...c, resizable: c.key !== 'joined' })));
    await fixture.whenStable();
    await fixture.whenStable();
    const handles = table.querySelectorAll<HTMLElement>('[role=separator]');
    expect(handles.length).toBe(2);
    const handle = handles[0];
    expect(handle.getAttribute('aria-label')).toBe('Resize Name');
    expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(0);

    host.columns.update((cols) => cols.map((c) => (c.key === 'name' ? { ...c, width: 200 } : c)));
    await fixture.whenStable();
    const press = (key: string, shiftKey = false) => {
      handle.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
    };
    press('ArrowRight');
    await fixture.whenStable();
    expect(host.columns()[0].width).toBe(210);
    expect(handle.getAttribute('aria-valuenow')).toBe('210');
    press('ArrowLeft', true);
    await fixture.whenStable();
    expect(host.columns()[0].width).toBe(160);
    press('Home');
    await fixture.whenStable();
    expect(host.columns()[0].width).toBe(48);
    press('ArrowLeft');
    press('Tab');
    await fixture.whenStable();
    expect(host.columns()[0].width).toBe(48);
    host.columns.update((cols) =>
      cols.map((c) => (c.key === 'name' ? { ...c, width: 200, maxWidth: 220 } : c)),
    );
    await fixture.whenStable();
    press('ArrowUp', true);
    await fixture.whenStable();
    expect(host.columns()[0].width).toBe(220);
    press('ArrowDown');
    await fixture.whenStable();
    expect(host.columns()[0].width).toBe(210);

    const th = handle.closest('th')!;
    const start = th.getBoundingClientRect().width;
    const rect = handle.getBoundingClientRect();
    const init = { bubbles: true, pointerId: 1, button: 0, clientX: rect.left, clientY: rect.top };
    handle.dispatchEvent(new PointerEvent('pointerdown', { ...init, button: 2 }));
    handle.dispatchEvent(new PointerEvent('pointerdown', init));
    handle.dispatchEvent(new PointerEvent('pointermove', { ...init, clientX: rect.left - 30 }));
    await fixture.whenStable();
    expect(host.columns()[0].width).toBe(Math.round(start - 30));
    handle.dispatchEvent(new PointerEvent('pointerup', init));
    handle.dispatchEvent(new PointerEvent('pointermove', { ...init, clientX: rect.left + 90 }));
    await fixture.whenStable();
    expect(host.columns()[0].width).toBe(Math.round(start - 30));
  });

  it('reorders columns by dragging headers and with moveColumn', async () => {
    const { fixture, host, table, headers } = await setup();
    const instance = fixture.debugElement.query(By.directive(BsTable))
      .componentInstance as BsTable<Person>;
    const ths = () => table.querySelectorAll<HTMLElement>('thead th');
    const drag = (type: string, target: HTMLElement) => {
      const event = new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      });
      target.dispatchEvent(event);
      return event;
    };
    expect(ths()[0].hasAttribute('draggable')).toBe(false);
    drag('dragstart', ths()[0]);
    expect(drag('dragover', ths()[2]).defaultPrevented).toBe(false);
    drag('drop', ths()[2]);

    host.reorderable.set(true);
    await fixture.whenStable();
    expect(ths()[0].getAttribute('draggable')).toBe('true');
    drag('dragstart', ths()[0]);
    expect(drag('dragover', ths()[2]).defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(ths()[2].classList).toContain('table-active');
    drag('dragover', ths()[0]);
    await fixture.whenStable();
    expect(table.querySelector('thead .table-active')).toBeNull();
    drag('drop', ths()[2]);
    await fixture.whenStable();
    expect(headers()).toEqual(['Age', 'Joined', 'Name']);
    expect(table.querySelector('thead .table-active')).toBeNull();

    instance.moveColumn('name', 0);
    instance.moveColumn('name', 0);
    instance.moveColumn('nope', 1);
    await fixture.whenStable();
    expect(headers()).toEqual(['Name', 'Age', 'Joined']);
  });
});

describe('BsTable templates', () => {
  @Component({
    imports: [BsTable, BsTableCell, BsTableDetail, BsTableEmpty],
    template: `
      <table bsTable [data]="data()" [(columns)]="columns" [(expanded)]="expanded">
        <ng-template
          bsTableCell="name"
          [bsTableCellOf]="data()"
          let-row
          let-value="value"
          let-i="index">
          <strong>{{ i }}:{{ value }}:{{ row.id }}</strong>
        </ng-template>
        <ng-template bsTableDetail [bsTableDetailOf]="data()" let-row
          >Details of {{ row.name }}</ng-template
        >
        <ng-template bsTableEmpty><em>Nobody here</em></ng-template>
        <tfoot>
          <tr>
            <td colspan="4">Footer</td>
          </tr>
        </tfoot>
      </table>
    `,
  })
  class TemplateHost {
    readonly data = signal(PEOPLE.slice(0, 2));
    readonly columns = signal(columns());
    readonly expanded = signal<Person[]>([]);
  }

  it('renders cell, detail, empty and footer content', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await fixture.whenStable();
    const table: HTMLTableElement = fixture.nativeElement.querySelector('table');
    const host = fixture.componentInstance;
    expect(table.querySelector('thead th .visually-hidden')!.textContent).toBe('Details');
    expect(table.querySelector('tbody strong')!.textContent).toBe('0:Carol:1');
    expect(table.querySelector('tfoot')!.textContent.trim()).toBe('Footer');

    const toggle = table.querySelector<HTMLButtonElement>('tbody button')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.hasAttribute('aria-controls')).toBe(false);
    expect(toggle.getAttribute('aria-label')).toBe('Show details');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(host.expanded()).toEqual([PEOPLE[0]]);
    const detail = table.querySelector<HTMLElement>(`#${toggle.getAttribute('aria-controls')!}`)!;
    expect(detail.textContent.trim()).toBe('Details of Carol');
    expect(detail.querySelector('td')!.getAttribute('colspan')).toBe('4');
    toggle.click();
    await fixture.whenStable();
    expect(host.expanded()).toEqual([]);
    expect(table.querySelectorAll('tbody tr').length).toBe(2);

    host.data.set([]);
    await fixture.whenStable();
    expect(table.querySelector('tbody em')!.textContent).toBe('Nobody here');
  });

  it('labels rows with the selection header when there are no columns', async () => {
    @Component({
      imports: [BsTable],
      template: `<table bsTable [data]="data" [columns]="[]" selection="multiple"></table>`,
    })
    class NoColumns {
      readonly data = [{ id: 1 }];
    }
    const fixture = TestBed.createComponent(NoColumns);
    await fixture.whenStable();
    const box = (fixture.nativeElement as HTMLElement).querySelector('tbody input')!;
    expect(box.getAttribute('aria-label')).toBe('Select');
  });
});
