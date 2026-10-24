import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  Provider,
  signal,
  TemplateRef,
  untracked,
} from '@angular/core';
import { BsCheck, BsRadio } from 'bootstrap-ng/forms';
import { BsSpinner } from 'bootstrap-ng/spinner';
import {
  BsLiveAnnouncer,
  BsTheme,
  configToken,
  provideConfig,
  themeClass,
  uniqueId,
} from 'bootstrap-ng/util';

/** Direction of a sorted column. */
export type BsSortDirection = 'asc' | 'desc';

/** A sorted column and its direction. */
export interface BsTableSort {
  key: string;
  direction: BsSortDirection;
}

/** How rows can be selected: not at all, one at a time with radios, or many with checkboxes. */
export type BsTableSelection = 'none' | 'single' | 'multiple';

/** Breakpoint below which rows stack into blocks, or `always`. */
export type BsTableStacked = 'always' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** A column of a `table[bsTable]`. */
export interface BsTableColumn<T> {
  /** Unique key. Also the row property shown when `value` is not set. */
  key: string;
  /** Header text. */
  header: string;
  /** Reads the cell value from a row. Defaults to `row[key]`. */
  value?: (row: T) => unknown;
  /** Formats the cell value as text, for example a date or a currency. */
  format?: (value: unknown, row: T) => string;
  /** Shows a sort button in the header. */
  sortable?: boolean;
  /** Compares two rows for sorting, ascending. Defaults to comparing values. */
  compare?: (a: T, b: T) => number;
  /** Includes the column in the text filter. Defaults to `true`. */
  filterable?: boolean;
  /** Hides the column. */
  hidden?: boolean;
  /** Width in pixels. Set by the table when the user resizes the column. */
  width?: number;
  /** Smallest width in pixels when resizing. Defaults to 48. */
  minWidth?: number;
  /** Largest width in pixels when resizing. Defaults to 1000. */
  maxWidth?: number;
  /** Shows a resize handle. Defaults to the table's `resizable` input. */
  resizable?: boolean;
  /** Text alignment of the header and cells. */
  align?: 'start' | 'center' | 'end';
  /** Classes added to the header cell. */
  headerClass?: string;
  /** Classes added to each cell. */
  cellClass?: string;
  /**
   * Keeps the column in view while the table scrolls sideways, at the start or the end.
   * Pinned columns move to that side of the table.
   */
  pinned?: 'start' | 'end';
}

/** Context of a `bsTableCell` template. */
export interface BsTableCellContext<T> {
  /** The row. */
  $implicit: T;
  /** The cell value, from the column's `value` or `row[key]`. */
  value: unknown;
  /** The column. */
  column: BsTableColumn<T>;
  /** Index of the row on the current page. */
  index: number;
}

/** Context of a `bsTableDetail` template. */
export interface BsTableDetailContext<T> {
  /** The row. */
  $implicit: T;
}

/**
 * Custom content for the cells of one column. Name the column by its key. Add
 * `[bsTableCellOf]="rows"` to type the row in strict templates.
 *
 * ```html
 * <ng-template bsTableCell="status" let-row let-value="value">
 *   <span class="badge">{{ value }}</span>
 * </ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[bsTableCell]' })
export class BsTableCell<T> {
  readonly template = inject<TemplateRef<BsTableCellContext<T>>>(TemplateRef);
  /** Key of the column. */
  readonly key = input.required<string>({ alias: 'bsTableCell' });
  /** The table's rows. Only used to type the template context. */
  readonly bsTableCellOf = input<readonly T[]>([]);

  static ngTemplateContextGuard<T>(
    _dir: BsTableCell<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only the type predicate uses it
    ctx: unknown,
  ): ctx is BsTableCellContext<T> {
    return true;
  }
}

/**
 * Content of the expanded row under each row. Adding it adds a toggle button to each row.
 *
 * ```html
 * <ng-template bsTableDetail let-row>{{ row.notes }}</ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[bsTableDetail]' })
export class BsTableDetail<T> {
  readonly template = inject<TemplateRef<BsTableDetailContext<T>>>(TemplateRef);
  /** The table's rows. Only used to type the template context. */
  readonly bsTableDetailOf = input<readonly T[]>([]);

  static ngTemplateContextGuard<T>(
    _dir: BsTableDetail<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only the type predicate uses it
    ctx: unknown,
  ): ctx is BsTableDetailContext<T> {
    return true;
  }
}

/** Content shown when there are no rows, instead of `emptyText`. */
@Directive({ selector: 'ng-template[bsTableEmpty]' })
export class BsTableEmpty {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/** Compares two cell values in ascending order. */
function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }
  return collator.compare(String(a), String(b));
}

/** Defaults for the inputs of tables. Inputs set on a component win over them. */
export interface BsTableConfig {
  /** Rows per page. `0` shows every row. */
  pageSize: number;
  /** Keeps the header visible while the table scrolls inside its container. */
  stickyHeader: boolean;
  /** Zebra-stripes the rows. */
  striped: boolean;
  /** Highlights the row under the pointer. */
  hover: boolean;
  /** Adds borders on every side of the table and its cells. */
  bordered: boolean;
  /** Cell density. `sm` halves the padding. */
  size: 'sm' | 'md';
  /** Text shown when there are no rows. */
  emptyText: string;
  /** Text of the loading row. */
  loadingText: string;
  /** Accessible label of the select-all checkbox. */
  selectAllLabel: string;
  /** Accessible name of the selection column's header. */
  selectHeader: string;
  /** Accessible label of each row's checkbox or radio. Defaults to the first column's text. */
  rowLabel: (row: unknown) => string;
  /** Accessible name of the expand column's header. */
  detailHeader: string;
  /** Accessible label of each row's expand button. */
  expandLabel: string;
  /** Start of each resize handle's accessible label, followed by the column header. */
  resizeLabel: string;
  /**
   * Message screen readers announce after a sort button changes the sort, given the
   * column header and the new direction (`null` when unsorted). Return `''` to stay silent.
   */
  sortAnnouncement: (header: string, direction: BsSortDirection | null) => string;
}

/** The defaults set with `provideBsTableConfig()`. */
export const BS_TABLE_CONFIG = configToken<BsTableConfig>('BS_TABLE_CONFIG');

/**
 * Sets defaults for the inputs of tables, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsTableConfig({ hover: true, emptyText: 'Aucun résultat' })]
 * ```
 */
export function provideBsTableConfig(config: Partial<BsTableConfig>): Provider {
  return provideConfig(BS_TABLE_CONFIG, config);
}

/**
 * A data table on Bootstrap's `.table`. Give it rows and column definitions, and it
 * renders the header and body with sorting, a text filter, pagination, row selection,
 * expandable rows, and resizable and reorderable columns. Put a `<nav bsPagination>`
 * and a search field next to it and bind them to `page` and `filter`.
 *
 * ```html
 * <table bsTable [data]="people" [(columns)]="columns" [(sort)]="sort" hover>
 *   <caption>Team members</caption>
 * </table>
 * ```
 */
@Component({
  selector: 'table[bsTable]',
  exportAs: 'bsTable',
  imports: [NgTemplateOutlet, BsCheck, BsRadio, BsSpinner],
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.aria-rowcount]': 'virtualScroll() ? rows().length + 1 : null',
  },
  styles: `
    .bs-table-sort {
      display: inline-flex;
      gap: 0.25rem;
      align-items: center;
      min-block-size: 1.5rem;
      padding: 0;
      font: inherit;
      color: inherit;
      text-align: inherit;
      background: none;
      border: 0;
    }
    .bs-table-resizer {
      position: absolute;
      inset-block: 0;
      inset-inline-end: 0;
      inline-size: 0.5rem;
      cursor: col-resize;
      touch-action: none;
    }
    .bs-table-resizer:hover,
    .bs-table-resizer:focus-visible {
      background-color: var(--bs-border-color);
    }
    .bs-table-pinned {
      position: sticky;
      z-index: 1;
    }
    .bs-table-pin-edge::after {
      position: absolute;
      inset-block: 0;
      inset-inline-end: 0;
      content: '';
      border-inline-end: 1px solid var(--bs-border-color);
    }
    .bs-table-pin-edge-end::after {
      inset-inline: 0 auto;
      border-inline-start: 1px solid var(--bs-border-color);
      border-inline-end: 0;
    }
  `,
  template: `
    <ng-content select="caption" />
    <thead [class.sticky-top]="stickyHeader()">
      <tr>
        @if (detail()) {
          <th scope="col" [class]="pinClass(detailKey)" [style]="pinStyle(detailKey)">
            <span class="visually-hidden">{{ detailHeader() }}</span>
          </th>
        }
        @if (selection() === 'multiple') {
          <th scope="col" [class]="pinClass(selectKey)" [style]="pinStyle(selectKey)">
            <input
              type="checkbox"
              bsCheck
              [checked]="allSelected()"
              [indeterminate]="someSelected()"
              [disabled]="rows().length === 0"
              [attr.aria-label]="selectAllLabel()"
              (change)="toggleAll()" />
          </th>
        } @else if (selection() === 'single') {
          <th scope="col" [class]="pinClass(selectKey)" [style]="pinStyle(selectKey)">
            <span class="visually-hidden">{{ selectHeader() }}</span>
          </th>
        }
        @for (column of visibleColumns(); track column.key) {
          <th
            #th
            scope="col"
            [class]="(column.headerClass ?? '') + ' ' + pinClass(column.key)"
            [class.text-center]="column.align === 'center'"
            [class.text-end]="column.align === 'end'"
            [class.position-relative]="isResizable(column) && !column.pinned"
            [class.table-active]="dropTarget() === column.key"
            [style]="pinStyle(column.key)"
            [style.width.px]="column.width"
            [attr.aria-sort]="ariaSort(column)"
            [attr.draggable]="reorderable() ? 'true' : null"
            (dragstart)="dragStart($event, column)"
            (dragover)="dragOver($event, column)"
            (dragleave)="dropTarget.set(null)"
            (drop)="drop($event, column)"
            (dragend)="dragEnd()">
            @if (column.sortable) {
              <button type="button" class="bs-table-sort" (click)="toggleSort(column)">
                {{ column.header }}
                <svg
                  aria-hidden="true"
                  width="1em"
                  height="1em"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  [class.opacity-50]="!sortOf(column)">
                  @switch (sortOf(column)) {
                    @case ('asc') {
                      <path
                        fill-rule="evenodd"
                        d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5" />
                    }
                    @case ('desc') {
                      <path
                        fill-rule="evenodd"
                        d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                    }
                    @default {
                      <path
                        fill-rule="evenodd"
                        d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 1 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5" />
                    }
                  }
                </svg>
                @if (sortOrder().length > 1 && sortIndex(column); as priority) {
                  <small class="fg-3">{{ priority }}</small>
                }
              </button>
            } @else {
              {{ column.header }}
            }
            @if (isResizable(column)) {
              <span
                class="bs-table-resizer"
                role="separator"
                aria-orientation="vertical"
                tabindex="0"
                [attr.aria-label]="resizeLabel() + ' ' + column.header"
                [attr.aria-valuenow]="widthOf(column)"
                [attr.aria-valuemin]="column.minWidth ?? defaultMinWidth"
                [attr.aria-valuemax]="column.maxWidth ?? defaultMaxWidth"
                (pointerdown)="startResize($event, column, th)"
                (keydown)="resizeKey($event, column, th)"
                (click)="$event.stopPropagation()"></span>
            }
          </th>
        }
      </tr>
    </thead>
    <tbody>
      @if (loading()) {
        <tr>
          <td class="text-center" [attr.colspan]="colspan()">
            <bs-spinner size="sm" label="" class="me-3 align-middle" />{{ loadingText() }}
          </td>
        </tr>
      } @else {
        @if (virtualScroll() && range().start > 0) {
          <tr hidden></tr>
          <tr aria-hidden="true">
            <td
              class="p-0 border-0"
              [attr.colspan]="colspan()"
              [style.height.px]="range().start * rowSize()"></td>
          </tr>
        }
        @for (row of renderedRows(); track key(row); let n = $index) {
          @let i = range().start + n;
          <tr
            [class.table-active]="isSelected(row)"
            [attr.aria-rowindex]="virtualScroll() ? i + 2 : null">
            @if (detail()) {
              <td [class]="pinClass(detailKey)" [style]="pinStyle(detailKey)">
                <button
                  type="button"
                  class="btn btn-sm btn-text btn-icon"
                  [attr.aria-expanded]="isExpanded(row)"
                  [attr.aria-controls]="isExpanded(row) ? id + '-detail-' + i : null"
                  [attr.aria-label]="expandLabel()"
                  (click)="toggleExpanded(row)">
                  <svg
                    aria-hidden="true"
                    width="1em"
                    height="1em"
                    viewBox="0 0 16 16"
                    fill="currentColor">
                    @if (isExpanded(row)) {
                      <path
                        fill-rule="evenodd"
                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                    } @else {
                      <path
                        fill-rule="evenodd"
                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                    }
                  </svg>
                </button>
              </td>
            }
            @if (selection() === 'multiple') {
              <td [class]="pinClass(selectKey)" [style]="pinStyle(selectKey)">
                <input
                  type="checkbox"
                  bsCheck
                  [checked]="isSelected(row)"
                  [attr.aria-label]="rowLabel()(row)"
                  (change)="toggleSelected(row)" />
              </td>
            } @else if (selection() === 'single') {
              <td [class]="pinClass(selectKey)" [style]="pinStyle(selectKey)">
                <input
                  type="radio"
                  bsRadio
                  [name]="id + '-select'"
                  [checked]="isSelected(row)"
                  [attr.aria-label]="rowLabel()(row)"
                  (change)="select(row)" />
              </td>
            }
            @for (column of visibleColumns(); track column.key) {
              <td
                [class]="(column.cellClass ?? '') + ' ' + pinClass(column.key)"
                [class.text-center]="column.align === 'center'"
                [class.text-end]="column.align === 'end'"
                [style]="pinStyle(column.key)"
                [attr.data-cell]="column.header">
                @if (cellTemplates().get(column.key); as cell) {
                  <ng-container
                    *ngTemplateOutlet="
                      cell;
                      context: { $implicit: row, value: valueOf(row, column), column, index: i }
                    " />
                } @else {
                  {{ display(row, column) }}
                }
              </td>
            }
          </tr>
          @if (detail(); as detail) {
            @if (isExpanded(row)) {
              <tr [id]="id + '-detail-' + i">
                <td [attr.colspan]="colspan()">
                  <ng-container *ngTemplateOutlet="detail.template; context: { $implicit: row }" />
                </td>
              </tr>
            }
          }
        } @empty {
          <tr>
            <td class="text-center fg-3" [attr.colspan]="colspan()">
              @if (empty(); as empty) {
                <ng-container *ngTemplateOutlet="empty.template" />
              } @else {
                {{ emptyText() }}
              }
            </td>
          </tr>
        }
        @if (virtualScroll() && range().end < rows().length) {
          <tr aria-hidden="true">
            <td
              class="p-0 border-0"
              [attr.colspan]="colspan()"
              [style.height.px]="(rows().length - range().end) * rowSize()"></td>
          </tr>
        }
      }
    </tbody>
    <ng-content select="tfoot" />
  `,
})
export class BsTable<T> {
  private readonly config = inject(BS_TABLE_CONFIG);
  private readonly element = inject<ElementRef<HTMLTableElement>>(ElementRef).nativeElement;
  private readonly announcer = inject(BsLiveAnnouncer);

  protected readonly id = uniqueId('bs-table');
  protected readonly defaultMinWidth = 48;
  protected readonly defaultMaxWidth = 1000;

  /** Rows of the table. */
  readonly data = input.required<readonly T[]>();
  /**
   * Column definitions. Supports `[(columns)]`: the table writes back new widths when a
   * column is resized and the new order when one is moved.
   */
  readonly columns = model.required<BsTableColumn<T>[]>();
  /** Returns a unique key for a row, used to track rows, selection and expansion. */
  readonly rowKey = input<(row: T) => unknown>((row) => row);

  /** Sorted column and direction, or `null`. Supports `[(sort)]`. */
  readonly sort = model<BsTableSort | null>(null);
  /**
   * Sorts by several columns: each sort button adds its column to `sorts`, or cycles it
   * there, and keeps the others. Use `[(sorts)]` instead of `[(sort)]`.
   */
  readonly multiSort = input(false, { transform: booleanAttribute });
  /** Sorted columns, most important first, with `multiSort`. Supports `[(sorts)]`. */
  readonly sorts = model<BsTableSort[]>([]);
  /** Text filter matched against the text of every filterable, visible column. */
  readonly filter = input('');
  /** Custom filter, called with each row and the trimmed `filter` text. */
  readonly filterFn = input<((row: T, filter: string) => boolean) | null>(null);
  /** Current page, starting at 1. Supports `[(page)]`. */
  readonly page = model(1);
  /** Rows per page. `0` shows every row. */
  readonly pageSize = input(this.config.pageSize ?? 0, { transform: numberAttribute });
  /**
   * Leaves sorting, filtering and paging to you, for example on a server: the table shows
   * `data` as it is and only updates `sort` and `page`. Set `total` for `pageCount`.
   */
  readonly manual = input(false, { transform: booleanAttribute });
  /** Number of rows across all pages, in `manual` mode. */
  readonly total = input<number | null>(null);

  /** How rows can be selected. */
  readonly selection = input<BsTableSelection>('none');
  /** Selected rows. Supports `[(selected)]`. */
  readonly selected = model<T[]>([]);
  /** Expanded rows, when there's a `bsTableDetail` template. Supports `[(expanded)]`. */
  readonly expanded = model<T[]>([]);

  /** Shows resize handles on every column. A column's `resizable` overrides it. */
  readonly resizable = input(false, { transform: booleanAttribute });
  /** Lets users drag column headers to reorder them. */
  readonly reorderable = input(false, { transform: booleanAttribute });
  /** Keeps the header visible while the table scrolls inside its container. */
  readonly stickyHeader = input(this.config.stickyHeader ?? false, { transform: booleanAttribute });
  /**
   * Renders only the rows in view, plus a few around them, so long tables stay fast.
   * Put the table in a scroll container with a height, or let the page scroll. Rows
   * should all be the same height.
   */
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  /** Height of each row in pixels with `virtualScroll`. Measured from the first row when not set. */
  readonly rowHeight = input<number | null>(null);
  /** Shows a loading row instead of the rows and sets `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Zebra-stripes the rows. */
  readonly striped = input(this.config.striped ?? false, { transform: booleanAttribute });
  /** Highlights the row under the pointer. */
  readonly hover = input(this.config.hover ?? false, { transform: booleanAttribute });
  /** Adds borders on every side of the table and its cells. */
  readonly bordered = input(this.config.bordered ?? false, { transform: booleanAttribute });
  /** Removes all borders. */
  readonly borderless = input(false, { transform: booleanAttribute });
  /** Cell density. `sm` halves the padding. */
  readonly size = input<'sm' | 'md'>(this.config.size ?? 'md');
  /** Theme color of the table. */
  readonly theme = input<BsTheme | null>(null);
  /**
   * Stacks each row into a block below a breakpoint of the surrounding
   * `.table-responsive` container, or `always`.
   */
  readonly stacked = input<BsTableStacked | null>(null);

  /** Text shown when there are no rows. */
  readonly emptyText = input(this.config.emptyText ?? 'No results');
  /** Text of the loading row. */
  readonly loadingText = input(this.config.loadingText ?? 'Loading…');
  /** Accessible label of the select-all checkbox. */
  readonly selectAllLabel = input(this.config.selectAllLabel ?? 'Select all rows');
  /** Accessible name of the selection column's header. */
  readonly selectHeader = input(this.config.selectHeader ?? 'Select');
  /** Accessible label of each row's checkbox or radio. Defaults to the first column's text. */
  readonly rowLabel = input<(row: T) => string>(
    this.config.rowLabel ?? ((row) => this.defaultRowLabel(row)),
  );
  /** Accessible name of the expand column's header. */
  readonly detailHeader = input(this.config.detailHeader ?? 'Details');
  /** Accessible label of each row's expand button. */
  readonly expandLabel = input(this.config.expandLabel ?? 'Show details');
  /** Start of each resize handle's accessible label, followed by the column header. */
  readonly resizeLabel = input(this.config.resizeLabel ?? 'Resize');
  /**
   * Message screen readers announce after a sort button changes the sort, given the
   * column header and the new direction (`null` when unsorted). Return `''` to stay silent.
   */
  readonly sortAnnouncement = input<(header: string, direction: BsSortDirection | null) => string>(
    this.config.sortAnnouncement ??
      ((header, direction) =>
        direction
          ? `Sorted by ${header}, ${direction === 'asc' ? 'ascending' : 'descending'}`
          : 'Not sorted'),
  );

  private readonly cells = contentChildren<BsTableCell<T>>(BsTableCell);
  protected readonly detail = contentChild<BsTableDetail<T>>(BsTableDetail);
  protected readonly empty = contentChild(BsTableEmpty);

  protected readonly cellTemplates = computed(
    () => new Map(this.cells().map((cell) => [cell.key(), cell.template] as const)),
  );

  /** Columns that aren't hidden, in display order: pinned to the start, unpinned, pinned to the end. */
  readonly visibleColumns = computed(() => {
    const columns = this.columns().filter((column) => !column.hidden);
    const rank = (column: BsTableColumn<T>) =>
      column.pinned === 'start' ? 0 : column.pinned === 'end' ? 2 : 1;
    return columns.some((column) => column.pinned)
      ? [...columns].sort((a, b) => rank(a) - rank(b))
      : columns;
  });

  /** Sorted columns, most important first. */
  protected readonly sortOrder = computed<readonly BsTableSort[]>(() => {
    if (this.multiSort()) {
      return this.sorts();
    }
    const sort = this.sort();
    return sort ? [sort] : [];
  });

  /** Rows matching the filter, before sorting and paging. */
  readonly filteredRows = computed<readonly T[]>(() => {
    const data = this.data();
    const query = this.filter().trim();
    if (this.manual() || !query) {
      return data;
    }
    const filterFn = this.filterFn();
    if (filterFn) {
      return data.filter((row) => filterFn(row, query));
    }
    const needle = query.toLocaleLowerCase();
    const columns = this.visibleColumns().filter((column) => column.filterable !== false);
    return data.filter((row) =>
      columns.some((column) => this.display(row, column).toLocaleLowerCase().includes(needle)),
    );
  });

  private readonly sortedRows = computed<readonly T[]>(() => {
    const rows = this.filteredRows();
    const sorts = this.sortOrder().flatMap((sort) => {
      const column = this.columns().find((c) => c.key === sort.key);
      return column ? [{ column, factor: sort.direction === 'asc' ? 1 : -1 }] : [];
    });
    if (this.manual() || sorts.length === 0) {
      return rows;
    }
    return [...rows].sort((a, b) => {
      for (const { column, factor } of sorts) {
        let result: number;
        if (column.compare) {
          result = column.compare(a, b) * factor;
        } else {
          const x = this.valueOf(a, column);
          const y = this.valueOf(b, column);
          // Empty values go last in both directions.
          result =
            isBlank(x) || isBlank(y)
              ? Number(isBlank(x)) - Number(isBlank(y))
              : compareValues(x, y) * factor;
        }
        if (result) {
          return result;
        }
      }
      return 0;
    });
  });

  /** Number of rows across all pages. */
  readonly totalRows = computed(() =>
    this.manual() ? (this.total() ?? this.data().length) : this.filteredRows().length,
  );

  /** Number of pages, at least 1. */
  readonly pageCount = computed(() => {
    const size = this.pageSize();
    return size > 0 ? Math.max(1, Math.ceil(this.totalRows() / size)) : 1;
  });

  /** Current page clamped to the available pages, for example after filtering. */
  readonly currentPage = computed(() => Math.min(Math.max(this.page(), 1), this.pageCount()));

  /** Rows shown on the current page. */
  readonly rows = computed<readonly T[]>(() => {
    const rows = this.sortedRows();
    const size = this.pageSize();
    if (this.manual() || size <= 0) {
      return rows;
    }
    const start = (this.currentPage() - 1) * size;
    return rows.slice(start, start + size);
  });

  /** Rows of the page that are in view and rendered, with `virtualScroll`. */
  private readonly rowRange = signal({ start: 0, end: initialRows });
  /** Measured row height, when `rowHeight` isn't set. */
  private readonly measuredRowHeight = signal(estimatedRowHeight);

  protected readonly rowSize = computed(() => this.rowHeight() ?? this.measuredRowHeight());

  /** Range of rendered rows, within the rows of the page. */
  protected readonly range = computed(() => {
    const count = this.rows().length;
    if (!this.virtualScroll()) {
      return { start: 0, end: count };
    }
    const { start, end } = this.rowRange();
    return { start: Math.min(start, count), end: Math.min(end, count) };
  });

  protected readonly renderedRows = computed(() => {
    const { start, end } = this.range();
    const rows = this.rows();
    return start === 0 && end === rows.length ? rows : rows.slice(start, end);
  });

  private readonly selectedKeys = computed(() => new Set(this.selected().map(this.rowKey())));
  private readonly expandedKeys = computed(() => new Set(this.expanded().map(this.rowKey())));

  /** Whether every row on the page is selected. */
  readonly allSelected = computed(
    () => this.rows().length > 0 && this.rows().every((row) => this.isSelected(row)),
  );
  /** Whether some, but not all, rows on the page are selected. */
  readonly someSelected = computed(
    () => !this.allSelected() && this.rows().some((row) => this.isSelected(row)),
  );

  protected readonly colspan = computed(
    () =>
      this.visibleColumns().length +
      (this.detail() ? 1 : 0) +
      (this.selection() === 'none' ? 0 : 1),
  );

  protected readonly classes = computed(() =>
    [
      'table',
      this.size() === 'sm' ? 'table-sm' : '',
      this.striped() ? 'table-striped' : '',
      this.hover() ? 'table-hover' : '',
      this.bordered() ? 'table-bordered' : '',
      this.borderless() ? 'table-borderless' : '',
      themeClass(this.theme()),
      stackedClass(this.stacked()),
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** Measured widths of resizable columns that have no `width`, for `aria-valuenow`. */
  private readonly measured = signal<Readonly<Record<string, number>>>({});
  protected readonly detailKey = '#detail';
  protected readonly selectKey = '#select';
  /** Pinned cells by key: their side and offset from that side, and whether they're the edge. */
  private readonly pins = signal<
    ReadonlyMap<string, { side: 'start' | 'end'; offset: number; edge: boolean }>
  >(new Map());
  protected readonly dropTarget = signal<string | null>(null);
  private dragged: string | null = null;

  constructor() {
    // Pinned columns stick at the summed widths of the pinned cells before them.
    afterRenderEffect((onCleanup) => {
      const keys = this.cellKeys();
      const sides = keys.map((key) => this.pinSide(key));
      if (!sides.some(Boolean) || typeof ResizeObserver === 'undefined') {
        untracked(() => this.pins.set(new Map()));
        return;
      }
      const cells = Array.from(
        this.element.querySelectorAll<HTMLElement>(':scope > thead > tr > th[scope="col"]'),
      );
      const measure = () => {
        const widths = cells.map((cell) => cell.getBoundingClientRect().width);
        const pins = new Map<string, { side: 'start' | 'end'; offset: number; edge: boolean }>();
        let offset = 0;
        const lastStart = sides.lastIndexOf('start');
        for (let i = 0; i <= lastStart; i++) {
          pins.set(keys[i] ?? '', { side: 'start', offset, edge: i === lastStart });
          offset += widths[i] ?? 0;
        }
        offset = 0;
        const firstEnd = sides.indexOf('end');
        if (firstEnd >= 0) {
          for (let i = keys.length - 1; i >= firstEnd; i--) {
            pins.set(keys[i] ?? '', { side: 'end', offset, edge: i === firstEnd });
            offset += widths[i] ?? 0;
          }
        }
        this.pins.set(pins);
      };
      const observer = new ResizeObserver(measure);
      cells.forEach((cell) => observer.observe(cell));
      onCleanup(() => observer.disconnect());
    });

    // With virtualScroll, renders the rows that the scroll container or the window shows.
    afterRenderEffect((onCleanup) => {
      if (!this.virtualScroll()) {
        return;
      }
      const update = () => this.updateRange();
      const view = this.element.ownerDocument.defaultView;
      view?.addEventListener('scroll', update, { capture: true, passive: true });
      view?.addEventListener('resize', update, { passive: true });
      onCleanup(() => {
        view?.removeEventListener('scroll', update, { capture: true });
        view?.removeEventListener('resize', update);
      });
    });
    afterRenderEffect(() => {
      if (this.virtualScroll()) {
        this.rows();
        this.rowSize();
        untracked(() => this.updateRange());
      }
    });

    afterRenderEffect(() => {
      const keys = this.visibleColumns()
        .filter((column) => this.isResizable(column) && column.width === undefined)
        .map((column) => column.key);
      untracked(() => {
        const cells = this.headerCells();
        const next: Record<string, number> = {};
        for (const key of keys) {
          const cell = cells.get(key);
          if (cell) {
            next[key] = Math.round(cell.getBoundingClientRect().width);
          }
        }
        const current = this.measured();
        if (keys.some((key) => current[key] !== next[key])) {
          this.measured.set(next);
        }
      });
    });
  }

  /** Whether a row is selected. */
  isSelected(row: T): boolean {
    return this.selectedKeys().has(this.rowKey()(row));
  }

  /** Whether a row's detail is shown. */
  isExpanded(row: T): boolean {
    return this.expandedKeys().has(this.rowKey()(row));
  }

  /** Selects a row. With `multiple` selection it's added to the selected rows. */
  select(row: T): void {
    if (this.isSelected(row)) {
      return;
    }
    this.selected.update((selected) =>
      this.selection() === 'multiple' ? [...selected, row] : [row],
    );
  }

  /** Unselects a row. */
  deselect(row: T): void {
    const key = this.rowKey();
    const rowKey = key(row);
    this.selected.update((selected) => selected.filter((r) => key(r) !== rowKey));
  }

  /** Selects or unselects a row. */
  toggleSelected(row: T): void {
    if (this.isSelected(row)) {
      this.deselect(row);
    } else {
      this.select(row);
    }
  }

  /** Selects every row on the page, or unselects them when they all are. */
  toggleAll(): void {
    const key = this.rowKey();
    const page = this.rows();
    if (this.allSelected()) {
      const keys = new Set(page.map(key));
      this.selected.update((selected) => selected.filter((row) => !keys.has(key(row))));
    } else {
      this.selected.update((selected) => [
        ...selected,
        ...page.filter((row) => !this.isSelected(row)),
      ]);
    }
  }

  /** Shows or hides a row's detail. */
  toggleExpanded(row: T): void {
    const key = this.rowKey();
    const rowKey = key(row);
    this.expanded.update((expanded) =>
      this.isExpanded(row) ? expanded.filter((r) => key(r) !== rowKey) : [...expanded, row],
    );
  }

  /**
   * Cycles a sortable column through ascending, descending and unsorted, goes to page 1
   * and announces the new sort to screen readers. With `multiSort` the other sorted
   * columns stay sorted, and a newly sorted column comes after them.
   */
  toggleSort(column: BsTableColumn<T>): void {
    const current = this.sortOf(column);
    const direction = current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc';
    const sort: BsTableSort | null = direction && { key: column.key, direction };
    if (this.multiSort()) {
      this.sorts.update((sorts) => {
        const index = sorts.findIndex((s) => s.key === column.key);
        if (!sort) {
          return sorts.filter((s) => s.key !== column.key);
        }
        return index < 0 ? [...sorts, sort] : sorts.map((s, i) => (i === index ? sort : s));
      });
    } else {
      this.sort.set(sort);
    }
    this.page.set(1);
    const message = this.sortAnnouncement()(column.header, direction);
    if (message) {
      this.announcer.announce(message);
    }
  }

  /** Moves the column with `key` to `index` in `columns`. */
  moveColumn(key: string, index: number): void {
    const columns = [...this.columns()];
    const from = columns.findIndex((column) => column.key === key);
    if (from < 0) {
      return;
    }
    const to = Math.min(Math.max(index, 0), columns.length - 1);
    if (from === to) {
      return;
    }
    columns.splice(to, 0, ...columns.splice(from, 1));
    this.columns.set(columns);
  }

  /** Sets the width of a column in pixels, clamped to its `minWidth` and `maxWidth`. */
  setWidth(key: string, width: number): void {
    this.columns.update((columns) =>
      columns.map((column) =>
        column.key === key
          ? {
              ...column,
              width: Math.round(
                Math.min(
                  Math.max(width, column.minWidth ?? this.defaultMinWidth),
                  column.maxWidth ?? this.defaultMaxWidth,
                ),
              ),
            }
          : column,
      ),
    );
  }

  /** Reads a cell value. */
  protected valueOf(row: T, column: BsTableColumn<T>): unknown {
    return column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
  }

  /** Text of a cell. */
  protected display(row: T, column: BsTableColumn<T>): string {
    const value = this.valueOf(row, column);
    if (column.format) {
      return column.format(value, row);
    }
    switch (typeof value) {
      case 'string':
        return value;
      case 'number':
      case 'boolean':
      case 'bigint':
        return value.toString();
      case 'object':
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return value === null ? '' : JSON.stringify(value);
      default:
        return '';
    }
  }

  protected key(row: T): unknown {
    return this.rowKey()(row);
  }

  protected sortOf(column: BsTableColumn<T>): BsSortDirection | null {
    return this.sortOrder().find((sort) => sort.key === column.key)?.direction ?? null;
  }

  /** Position of a column in the sort order, from 1, or 0 when it isn't sorted. */
  protected sortIndex(column: BsTableColumn<T>): number {
    return this.sortOrder().findIndex((sort) => sort.key === column.key) + 1;
  }

  protected ariaSort(column: BsTableColumn<T>): string | null {
    // ARIA allows aria-sort on one header at a time, so only the first sort gets it.
    const sort = this.sortOrder().at(0);
    if (!column.sortable || sort?.key !== column.key) {
      return null;
    }
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }

  /** Keys of the header cells in order, including the expand and selection columns. */
  private readonly cellKeys = computed(() => [
    ...(this.detail() ? [this.detailKey] : []),
    ...(this.selection() === 'none' ? [] : [this.selectKey]),
    ...this.visibleColumns().map((column) => column.key),
  ]);

  /** Side a cell is pinned to. The expand and selection columns follow start-pinned columns. */
  private pinSide(key: string): 'start' | 'end' | null {
    if (key === this.detailKey || key === this.selectKey) {
      return this.visibleColumns().some((column) => column.pinned === 'start') ? 'start' : null;
    }
    return this.visibleColumns().find((column) => column.key === key)?.pinned ?? null;
  }

  protected pinClass(key: string): string {
    const pin = this.pins().get(key);
    if (!pin) {
      return '';
    }
    return pin.edge
      ? `bs-table-pinned bs-table-pin-edge${pin.side === 'end' ? ' bs-table-pin-edge-end' : ''}`
      : 'bs-table-pinned';
  }

  protected pinStyle(key: string): Record<string, string> | null {
    const pin = this.pins().get(key);
    return pin ? { [`inset-inline-${pin.side}`]: `${pin.offset}px` } : null;
  }

  /** Works out which rows the scroll container or the window shows, and renders those. */
  private updateRange(): void {
    const body = this.element.tBodies[0];
    const view = this.element.ownerDocument.defaultView;
    if (!body || !view) {
      return;
    }
    const row = body.querySelector<HTMLElement>(':scope > tr[aria-rowindex]');
    if (row && this.rowHeight() === null) {
      const height = row.getBoundingClientRect().height;
      if (height > 0 && Math.abs(height - this.measuredRowHeight()) > 0.5) {
        this.measuredRowHeight.set(height);
      }
    }
    let top = 0;
    let bottom = view.innerHeight;
    for (let parent = this.element.parentElement; parent; parent = parent.parentElement) {
      if (/auto|scroll/.test(getComputedStyle(parent).overflowY)) {
        const rect = parent.getBoundingClientRect();
        top = Math.max(top, rect.top);
        bottom = Math.min(bottom, rect.bottom);
        break;
      }
    }
    const size = Math.max(this.rowSize(), 1);
    const count = this.rows().length;
    const bodyTop = body.getBoundingClientRect().top;
    // Starts on an even row so the hidden spacer row keeps the stripes in step.
    let start = Math.floor((top - bodyTop) / size) - overscan;
    start = Math.max(0, Math.min(start - (start % 2), count));
    // Keeps at least the first rows rendered while the table is out of view, as on the server.
    const end = Math.min(
      Math.max(start + initialRows, Math.ceil((bottom - bodyTop) / size) + overscan),
      count,
    );
    const current = this.rowRange();
    if (current.start !== start || current.end !== end) {
      this.rowRange.set({ start, end });
    }
  }

  protected isResizable(column: BsTableColumn<T>): boolean {
    return column.resizable ?? this.resizable();
  }

  protected widthOf(column: BsTableColumn<T>): number {
    return column.width ?? this.measured()[column.key] ?? 0;
  }

  protected startResize(event: PointerEvent, column: BsTableColumn<T>, th: HTMLElement): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const handle = event.target as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startWidth = th.getBoundingClientRect().width;
    const rtl = getComputedStyle(th).direction === 'rtl';
    const move = (e: PointerEvent) => {
      const delta = (e.clientX - startX) * (rtl ? -1 : 1);
      this.setWidth(column.key, startWidth + delta);
    };
    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  protected resizeKey(event: KeyboardEvent, column: BsTableColumn<T>, th: HTMLElement): void {
    const step = event.shiftKey ? 50 : 10;
    const width = column.width ?? th.getBoundingClientRect().width;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        this.setWidth(column.key, width + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        this.setWidth(column.key, width - step);
        break;
      case 'Home':
        this.setWidth(column.key, column.minWidth ?? this.defaultMinWidth);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  protected dragStart(event: DragEvent, column: BsTableColumn<T>): void {
    if (!this.reorderable()) {
      return;
    }
    this.dragged = column.key;
    event.dataTransfer?.setData('text/plain', column.header);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  protected dragOver(event: DragEvent, column: BsTableColumn<T>): void {
    if (this.dragged === null) {
      return;
    }
    event.preventDefault();
    this.dropTarget.set(column.key === this.dragged ? null : column.key);
  }

  protected drop(event: DragEvent, column: BsTableColumn<T>): void {
    const dragged = this.dragged;
    if (dragged === null) {
      return;
    }
    event.preventDefault();
    this.moveColumn(
      dragged,
      this.columns().findIndex((c) => c.key === column.key),
    );
    this.dragEnd();
  }

  protected dragEnd(): void {
    this.dragged = null;
    this.dropTarget.set(null);
  }

  private headerCells(): Map<string, HTMLElement | undefined> {
    const cells = Array.from(
      this.element.querySelectorAll<HTMLElement>(':scope > thead > tr > th[scope="col"]'),
    );
    const offset = cells.length - this.visibleColumns().length;
    return new Map(this.visibleColumns().map((column, i) => [column.key, cells[i + offset]]));
  }

  private defaultRowLabel(row: T): string {
    const first = this.visibleColumns().at(0);
    return first ? this.display(row, first) : this.selectHeader();
  }
}

/** Rows rendered with `virtualScroll` before the table is measured, as on the server. */
const initialRows = 20;
/** Rows rendered above and below the visible ones with `virtualScroll`. */
const overscan = 8;
/** Row height before a row is measured: a `.table` row with one line of text. */
const estimatedRowHeight = 41;

function stackedClass(stacked: BsTableStacked | null): string {
  if (!stacked) {
    return '';
  }
  return stacked === 'always' ? 'table-stacked' : `${stacked}:table-stacked`;
}
