import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsDateSelectionMode, BsDateValue } from './calendar';
import { BsDatepicker, BsDatepickerDisplay } from './datepicker';

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
});
