import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsDateSelectionMode, BsDateValue, provideBsCalendarConfig } from 'bootstrap-ng/calendar';
import { BsFormControl, BsFormControlSize } from 'bootstrap-ng/forms';
import {
  BsDateFormat,
  BsDatepicker,
  BsDatepickerDisplay,
  provideBsDatepickerConfig,
} from './datepicker';

describe('BsDatepicker', () => {
  @Component({
    imports: [BsDatepicker, BsDatepickerDisplay, ReactiveFormsModule],
    template: `
      <label for="date">Date</label>
      <input
        id="date"
        type="text"
        bsDatepicker
        locale="en-US"
        min="2026-06-01"
        [calendarLabel]="calendarLabel()"
        [dateDisabled]="isHoliday"
        [selectionMode]="mode()"
        [formControl]="date" />
      <button type="button" bsDatepicker locale="en-US" [(value)]="filter">
        <span bsDatepickerDisplay>Select date</span>
      </button>
      <button type="button" id="outside">Outside</button>
    `,
  })
  class Host {
    readonly mode = signal<BsDateSelectionMode>('single');
    date = new FormControl<BsDateValue>('2026-06-10');
    readonly filter = signal<BsDateValue>(null);
    readonly calendarLabel = signal('Choose date');
    readonly isHoliday = (iso: string) => iso === '2026-06-15';
  }

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    document.body.append(root);
    const input = root.querySelector<HTMLInputElement>('input')!;
    const button = root.querySelector<HTMLButtonElement>('button[bsDatepicker]')!;
    const calendar = () => root.querySelector<HTMLElement>('[data-vc="calendar"]');
    const day = (iso: string) =>
      calendar()!.querySelector<HTMLButtonElement>(`[data-vc-date-btn][data-iso="${iso}"]`)!;
    return { fixture, root, input, button, calendar, day, component: fixture.componentInstance };
  }

  afterEach(() => document.body.querySelectorAll('[ng-version]').forEach((el) => el.remove()));

  it('shows the value and opens a calendar popup on focus', async () => {
    const { fixture, input, calendar } = await setup();
    expect(input.value).toBe('2026-06-10');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-haspopup')).toBe('dialog');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    input.focus();
    await fixture.whenStable();
    const popup = calendar()!;
    expect(popup).not.toBeNull();
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-controls')).toBe(popup.id);
    expect(popup.getAttribute('role')).toBe('dialog');
    expect(popup.hasAttribute('data-vc-input')).toBe(true);
    expect(popup.previousElementSibling).toBe(input);
    expect(
      popup.querySelector('[data-vc-date="2026-06-10"]')!.hasAttribute('data-vc-date-selected'),
    ).toBe(true);
  });

  it('sets inputmode="numeric" on inputs only on macOS and iPadOS', async () => {
    const userAgent = vi.spyOn(navigator, 'userAgent', 'get');
    userAgent.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    );
    const first = await setup();
    expect(first.input.getAttribute('inputmode')).toBe('numeric');
    expect(first.button.hasAttribute('inputmode')).toBe(false);
    document.body.querySelectorAll('[ng-version]').forEach((el) => el.remove());

    userAgent.mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    );
    const { input } = await setup();
    expect(input.hasAttribute('inputmode')).toBe(false);
    userAgent.mockRestore();
  });

  it('keeps an inputmode set on the input', async () => {
    const userAgent = vi
      .spyOn(navigator, 'userAgent', 'get')
      .mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    TestBed.overrideTemplate(Host, '<input type="text" inputmode="text" bsDatepicker />');
    const { input } = await setup();
    expect(input.getAttribute('inputmode')).toBe('text');
    userAgent.mockRestore();
  });

  it('selects a date, closes and returns focus', async () => {
    const { fixture, input, calendar, day, component } = await setup();
    input.focus();
    await fixture.whenStable();
    day('2026-06-12').click();
    await fixture.whenStable();
    expect(component.date.value).toBe('2026-06-12');
    expect(input.value).toBe('2026-06-12');
    expect(calendar()).toBeNull();
    expect(document.activeElement).toBe(input);
  });

  it('returns to the days on Escape in the month view, without closing', async () => {
    const { fixture, input, calendar, day } = await setup();
    input.focus();
    await fixture.whenStable();
    calendar()!.querySelector<HTMLButtonElement>('button[data-vc="month"]')!.click();
    await fixture.whenStable();
    const june = calendar()!.querySelector<HTMLButtonElement>('[data-vc-months-month="5"]')!;
    expect(document.activeElement).toBe(june);
    june.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(calendar()).not.toBeNull();
    expect(document.activeElement).toBe(day('2026-06-10'));
    day('2026-06-10').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(calendar()).toBeNull();
  });

  it('moves focus into the calendar with Arrow Down and closes on Escape', async () => {
    const { fixture, input, calendar, day } = await setup();
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(day('2026-06-10'));
    day('2026-06-10').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(calendar()).toBeNull();
    expect(document.activeElement).toBe(input);
  });

  it('closes on an outside click', async () => {
    const { fixture, root, input, calendar } = await setup();
    input.focus();
    await fixture.whenStable();
    root.querySelector<HTMLButtonElement>('#outside')!.click();
    await fixture.whenStable();
    expect(calendar()).toBeNull();
  });

  it('parses typed ISO dates and restores invalid text', async () => {
    const { fixture, input, component } = await setup();
    input.value = '2026-07-04';
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(component.date.value).toBe('2026-07-04');
    input.value = 'tomorrow';
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(input.value).toBe('2026-07-04');
    input.value = '';
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(component.date.value).toBeNull();
  });

  it('rejects typed dates before min or disabled', async () => {
    const { fixture, input, component } = await setup();
    input.value = '2026-05-20';
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(component.date.value).toBe('2026-06-10');
    expect(input.value).toBe('2026-06-10');
    input.value = '2026-06-15';
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(component.date.value).toBe('2026-06-10');
    expect(input.value).toBe('2026-06-10');
  });

  it('keeps the popup open until a range is complete', async () => {
    const { fixture, input, calendar, day, component } = await setup();
    component.mode.set('range');
    component.date.setValue(['2026-06-10']);
    input.focus();
    await fixture.whenStable();
    day('2026-06-14').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-06-10', '2026-06-14']);
    expect(calendar()).toBeNull();
    expect(input.value).toBe('2026-06-10 – 2026-06-14');
    input.click();
    await fixture.whenStable();
    day('2026-06-20').click();
    await fixture.whenStable();
    expect(calendar()).not.toBeNull();
  });

  it('restores the text of a button without a display when cleared', async () => {
    @Component({
      imports: [BsDatepicker],
      template: `<button type="button" bsDatepicker locale="en-US" [(value)]="date">
        <span aria-hidden="true">*</span> Pick a date
      </button>`,
    })
    class ButtonHost {
      readonly date = signal<BsDateValue>(null);
    }
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent?.trim()).toContain('Pick a date');
    fixture.componentInstance.date.set('2026-06-10');
    await fixture.whenStable();
    expect(button.textContent?.trim()).toBe('Jun 10, 2026');
    fixture.componentInstance.date.set(null);
    await fixture.whenStable();
    expect(button.textContent?.trim()).toContain('Pick a date');
    expect(button.querySelector('span[aria-hidden]')).not.toBeNull();
  });

  it('formats dates in a button display and focuses the calendar', async () => {
    const { fixture, button, calendar, day, component } = await setup();
    expect(button.textContent?.trim()).toBe('Select date');
    component.filter.set('2026-06-10');
    await fixture.whenStable();
    expect(button.textContent?.trim()).toBe('Jun 10, 2026');
    button.click();
    await fixture.whenStable();
    expect(calendar()).not.toBeNull();
    expect(document.activeElement).toBe(day('2026-06-10'));
    day('2026-06-11').click();
    await fixture.whenStable();
    expect(component.filter()).toBe('2026-06-11');
    expect(calendar()).toBeNull();
  });

  it('updates the popup label when calendarLabel changes', async () => {
    const { fixture, input, calendar, component } = await setup();
    input.focus();
    await fixture.whenStable();
    expect(calendar()!.getAttribute('aria-label')).toBe('Choose date');
    component.calendarLabel.set('Choose arrival date');
    await fixture.whenStable();
    expect(calendar()!.getAttribute('aria-label')).toBe('Choose arrival date');
  });

  it('sizes inputs but not buttons', async () => {
    @Component({
      imports: [BsDatepicker, BsFormControl],
      template: `
        <input type="text" aria-label="Date" class="form-control" bsDatepicker [size]="size()" />
        <input type="text" aria-label="Other" bsFormControl bsDatepicker size="lg" />
        <button type="button" bsDatepicker size="sm">Pick</button>
      `,
    })
    class SizeHost {
      readonly size = signal<BsFormControlSize>('md');
    }
    const fixture = TestBed.createComponent(SizeHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const [input, other] = fixture.nativeElement.querySelectorAll('input');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(input.className).toBe('form-control');
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(input.classList).toContain('form-control-sm');
    fixture.componentInstance.size.set('lg');
    await fixture.whenStable();
    expect(input.classList).toContain('form-control-lg');
    expect(input.classList).not.toContain('form-control-sm');
    expect(other.classList).toContain('form-control');
    expect(other.classList).toContain('form-control-lg');
    expect(other.hasAttribute('size')).toBe(false);
    expect(button.classList).not.toContain('form-control-sm');
  });

  it('passes week number options to the calendar', async () => {
    @Component({
      imports: [BsDatepicker],
      template: `<input
        type="text"
        aria-label="Date"
        bsDatepicker
        weekNumbers
        weekNumbering="simple"
        firstWeekday="0"
        value="2026-06-10" />`,
    })
    class WeekHost {}
    const fixture = TestBed.createComponent(WeekHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    document.body.append(root);
    root.querySelector('input')!.focus();
    await fixture.whenStable();
    const numbers = Array.from(root.querySelectorAll('[data-vc-week-number]')).map((n) =>
      n.textContent.trim(),
    );
    expect(numbers).toEqual(['23', '24', '25', '26', '27']);
  });

  it('passes wareki to the calendar', async () => {
    @Component({
      imports: [BsDatepicker],
      template: `<input
        type="text"
        aria-label="Date"
        bsDatepicker
        locale="ja-JP"
        wareki
        value="2026-03-31" />`,
    })
    class WarekiHost {}
    const fixture = TestBed.createComponent(WarekiHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    document.body.append(root);
    root.querySelector('input')!.focus();
    await fixture.whenStable();
    expect(root.querySelector('[data-vc="year"]')!.textContent.trim()).toBe('令和8年（2026）');
  });
});

describe('BsDatepicker API and options', () => {
  @Component({
    imports: [BsDatepicker, ReactiveFormsModule],
    template: `
      <label>
        Dates
        <input
          type="text"
          bsDatepicker
          #picker="bsDatepicker"
          locale="en-US"
          max="2026-06-20"
          [selectionMode]="mode()"
          [dateFormat]="dateFormat()"
          [open]="open()"
          (openChange)="changes.push($event)"
          [formControl]="dates" />
      </label>
      <button type="button" id="outside">Outside</button>
    `,
  })
  class ApiHost {
    readonly picker = viewChild.required<BsDatepicker>('picker');
    readonly mode = signal<BsDateSelectionMode>('multiple');
    readonly dateFormat = signal<BsDateFormat | null>(null);
    readonly open = signal(false);
    dates = new FormControl<BsDateValue>(['2026-06-10']);
    changes: boolean[] = [];
  }

  async function setup() {
    const fixture = TestBed.createComponent(ApiHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    document.body.append(root);
    const input = root.querySelector('input')!;
    const calendar = () => root.querySelector<HTMLElement>('[data-vc="calendar"]');
    const type = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    const component = fixture.componentInstance;
    return { fixture, root, input, calendar, type, component, picker: component.picker() };
  }

  afterEach(() => document.body.querySelectorAll('[ng-version]').forEach((el) => el.remove()));

  it('opens, closes and toggles through its API, and marks the control touched', async () => {
    const { fixture, calendar, component, picker } = await setup();
    picker.toggle();
    await fixture.whenStable();
    expect(picker.isOpen()).toBe(true);
    expect(calendar()).not.toBeNull();
    picker.show();
    expect(component.changes).toEqual([true]);
    expect(component.dates.touched).toBe(false);

    picker.toggle();
    await fixture.whenStable();
    expect(calendar()).toBeNull();
    expect(component.changes).toEqual([true, false]);
    expect(component.dates.touched).toBe(true);
    picker.hide();
    expect(component.changes).toEqual([true, false]);
  });

  it('does not open while disabled', async () => {
    const { fixture, input, calendar, component, picker } = await setup();
    component.dates.disable();
    await fixture.whenStable();
    picker.show();
    input.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    expect(picker.isOpen()).toBe(false);
    expect(calendar()).toBeNull();
  });

  it('opens from the open input', async () => {
    const { fixture, calendar, component } = await setup();
    component.open.set(true);
    await fixture.whenStable();
    expect(calendar()).not.toBeNull();
    component.open.set(false);
    await fixture.whenStable();
    expect(calendar()).toBeNull();
  });

  it('places the popup after the label that wraps the input', async () => {
    const { fixture, root, input, calendar } = await setup();
    input.focus();
    await fixture.whenStable();
    expect(calendar()!.previousElementSibling).toBe(root.querySelector('label'));
  });

  it('closes on Escape in the input', async () => {
    const { fixture, input, calendar } = await setup();
    input.focus();
    await fixture.whenStable();
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    input.dispatchEvent(event);
    await fixture.whenStable();
    expect(event.defaultPrevented).toBe(true);
    expect(calendar()).toBeNull();
    // With the calendar closed, Escape is left alone.
    const again = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    input.dispatchEvent(again);
    expect(again.defaultPrevented).toBe(false);
  });

  it('closes when focus moves outside, but not into the calendar', async () => {
    const { fixture, root, input, calendar } = await setup();
    input.focus();
    await fixture.whenStable();
    const day = calendar()!.querySelector<HTMLButtonElement>('[data-vc-date-btn]')!;
    input.dispatchEvent(new FocusEvent('focusout', { relatedTarget: day }));
    await fixture.whenStable();
    expect(calendar()).not.toBeNull();
    input.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));
    await fixture.whenStable();
    expect(calendar()).not.toBeNull();
    input.dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: root.querySelector('#outside') }),
    );
    await fixture.whenStable();
    expect(calendar()).toBeNull();
  });

  it('returns focus to the input when the calendar closes with focus inside', async () => {
    const { fixture, input, calendar, component, picker } = await setup();
    input.focus();
    await fixture.whenStable();
    calendar()!.querySelector<HTMLButtonElement>('[data-vc-date-btn]')!.focus();
    component.open.set(true);
    await fixture.whenStable();
    component.open.set(false);
    await fixture.whenStable();
    expect(calendar()).toBeNull();
    expect(document.activeElement).toBe(input);
    // Returning focus doesn't reopen the calendar.
    await fixture.whenStable();
    expect(picker.isOpen()).toBe(false);
    expect(calendar()).toBeNull();
  });

  it('parses several typed dates in multiple mode, sorted', async () => {
    const { component, input, type } = await setup();
    await type('2026-06-12, 2026-06-03');
    expect(component.dates.value).toEqual(['2026-06-03', '2026-06-12']);
    expect(input.value).toBe('2026-06-03, 2026-06-12');
    await type('2026-06-03, 2026-06-30');
    // After max, so the value stays.
    expect(component.dates.value).toEqual(['2026-06-03', '2026-06-12']);
    await type('');
    expect(component.dates.value).toEqual([]);
  });

  it('parses a typed range and rejects more than two dates', async () => {
    const { fixture, component, input, type } = await setup();
    component.mode.set('range');
    component.dates.setValue([]);
    await fixture.whenStable();
    await type('2026-06-08 to 2026-06-01');
    expect(component.dates.value).toEqual(['2026-06-01', '2026-06-08']);
    expect(input.value).toBe('2026-06-01 – 2026-06-08');
    await type('2026-06-01 - 2026-06-02 - 2026-06-03');
    expect(component.dates.value).toEqual(['2026-06-01', '2026-06-08']);
    expect(input.value).toBe('2026-06-01 – 2026-06-08');
    // Unchanged text is ignored.
    await type('2026-06-01 – 2026-06-08');
    expect(component.dates.value).toEqual(['2026-06-01', '2026-06-08']);
  });

  it('formats dates with options or a function', async () => {
    const { fixture, component, input } = await setup();
    component.dateFormat.set({ month: 'long', day: 'numeric' });
    await fixture.whenStable();
    expect(input.value).toBe('June 10');
    component.dateFormat.set((date, locale) => `${locale}:${date.getDate()}`);
    await fixture.whenStable();
    expect(input.value).toBe('en-US:10');
  });

  it('takes defaults from provideBsDatepickerConfig and provideBsCalendarConfig', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideBsCalendarConfig({ weekNumbers: true }),
        provideBsDatepickerConfig({
          calendarLabel: 'Pick a day',
          dateFormat: { dateStyle: 'long' },
          size: 'sm',
        }),
      ],
    });
    @Component({
      imports: [BsDatepicker],
      template: `<input
        type="text"
        aria-label="Date"
        bsDatepicker
        locale="en-US"
        [(value)]="date" />`,
    })
    class ConfigHost {
      readonly date = signal<BsDateValue>('2026-06-10');
    }
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    document.body.append(root);
    const input = root.querySelector('input')!;
    expect(input.value).toBe('June 10, 2026');
    expect(input.classList).toContain('form-control-sm');
    input.focus();
    await fixture.whenStable();
    const popup = root.querySelector<HTMLElement>('[data-vc="calendar"]')!;
    expect(popup.getAttribute('aria-label')).toBe('Pick a day');
    expect(popup.querySelectorAll('[data-vc-week-number]').length).toBeGreaterThan(0);
  });

  it('closes a button datepicker on a second click', async () => {
    @Component({
      imports: [BsDatepicker],
      template: `<button type="button" bsDatepicker locale="en-US">Pick</button>`,
    })
    class ButtonHost {}
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    document.body.append(root);
    const button = root.querySelector('button')!;
    button.click();
    await fixture.whenStable();
    expect(root.querySelector('[data-vc="calendar"]')).not.toBeNull();
    // A button doesn't open the calendar on focus or move into it with Arrow Down.
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    button.click();
    await fixture.whenStable();
    expect(root.querySelector('[data-vc="calendar"]')).toBeNull();
    button.dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();
    expect(root.querySelector('[data-vc="calendar"]')).toBeNull();
  });
});
