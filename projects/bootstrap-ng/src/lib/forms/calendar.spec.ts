import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BsCalendar,
  BsDateSelectionMode,
  BsDateValue,
  BsWeekNumbering,
  parseIsoDate,
  toIsoDate,
  weekNumber,
} from './calendar';

describe('calendar date helpers', () => {
  it('formats and parses ISO dates', () => {
    expect(toIsoDate(2026, 0, 32)).toBe('2026-02-01');
    expect(parseIsoDate('2026-02-30')).toBeNull();
    expect(parseIsoDate('2026-06-10')?.getDate()).toBe(10);
    expect(parseIsoDate('nope')).toBeNull();
  });

  it('numbers ISO 8601 weeks', () => {
    // 2026 starts on a Thursday, so its week 1 starts on 29 December 2025.
    expect(weekNumber(new Date(2025, 11, 29))).toBe(1);
    expect(weekNumber(new Date(2026, 5, 8))).toBe(24);
    // 2027 starts on a Friday, so its first days are in week 53 of 2026.
    expect(weekNumber(new Date(2026, 11, 28))).toBe(53);
    expect(weekNumber(new Date(2027, 0, 4))).toBe(1);
    // Weeks starting on Sunday take the number of the ISO week holding most of their days.
    expect(weekNumber(new Date(2026, 5, 7), 0)).toBe(24);
    expect(weekNumber(new Date(2027, 0, 3), 0)).toBe(1);
  });

  it('numbers weeks from 1 January', () => {
    expect(weekNumber(new Date(2025, 11, 28), 0, 'simple')).toBe(1);
    expect(weekNumber(new Date(2026, 0, 4), 0, 'simple')).toBe(2);
    expect(weekNumber(new Date(2026, 11, 20), 0, 'simple')).toBe(52);
    // The week holding 1 January 2027 is week 1, though it starts in 2026.
    expect(weekNumber(new Date(2026, 11, 27), 0, 'simple')).toBe(1);
    expect(weekNumber(new Date(2025, 11, 29), 1, 'simple')).toBe(1);
    expect(weekNumber(new Date(2026, 5, 8), 1, 'simple')).toBe(24);
  });
});

describe('BsCalendar', () => {
  @Component({
    imports: [BsCalendar, ReactiveFormsModule],
    template: `
      <div
        bsCalendar
        locale="en-US"
        [selectionMode]="mode()"
        [monthsCount]="months()"
        [colorMode]="colorMode()"
        min="2026-06-03"
        [formControl]="date"
        (selectionComplete)="completed.set($event)"></div>
    `,
  })
  class Host {
    readonly mode = signal<BsDateSelectionMode>('single');
    readonly months = signal(1);
    readonly colorMode = signal<'light' | 'dark' | null>(null);
    date = new FormControl<BsDateValue>('2026-06-10');
    readonly completed = signal<BsDateValue>(null);
  }

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('[bsCalendar]');
    const button = (iso: string) =>
      host.querySelector<HTMLButtonElement>(`[data-vc-date-btn][data-iso="${iso}"]`)!;
    const cell = (iso: string) => host.querySelector<HTMLElement>(`[data-vc-date="${iso}"]`)!;
    return { fixture, host, button, cell, component: fixture.componentInstance };
  }

  it('renders Bootstrap datepicker markup for the value month', async () => {
    const { host, cell, button } = await setup();
    expect(host.getAttribute('data-vc')).toBe('calendar');
    expect(host.querySelector('[data-vc="month"]')!.textContent).toBe('June');
    expect(host.querySelector('[data-vc="year"]')!.textContent).toBe('2026');
    expect(host.querySelector('[role="grid"]')).not.toBeNull();
    expect(host.querySelectorAll('[data-vc-week-day]')).toHaveLength(7);
    expect(host.querySelector('[data-vc-week-day]')!.textContent?.trim()).toBe('Mon');
    expect(host.querySelector('[data-vc-week-day]')!.getAttribute('aria-label')).toBe('Monday');
    expect(host.querySelector('[data-vc-week-day]')!.hasAttribute('title')).toBe(false);
    expect(cell('2026-06-10').hasAttribute('data-vc-date-selected')).toBe(true);
    expect(cell('2026-06-10').getAttribute('aria-selected')).toBe('true');
    expect(cell('2026-06-02').hasAttribute('data-vc-date-disabled')).toBe(true);
    expect(button('2026-06-10').tabIndex).toBe(0);
    expect(button('2026-06-11').tabIndex).toBe(-1);
    expect(button('2026-06-10').getAttribute('aria-label')).toBe('Wednesday, June 10, 2026');
  });

  it('inherits the color mode unless colorMode forces one', async () => {
    const { fixture, host, component } = await setup();
    expect(host.style.colorScheme).toBe('inherit');
    expect(host.hasAttribute('data-bs-theme')).toBe(false);
    component.colorMode.set('dark');
    await fixture.whenStable();
    expect(host.style.colorScheme).toBe('');
    expect(host.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('selects a date and ignores disabled ones', async () => {
    const { fixture, button, component } = await setup();
    button('2026-06-12').click();
    await fixture.whenStable();
    expect(component.date.value).toBe('2026-06-12');
    expect(component.completed()).toBe('2026-06-12');
    expect(component.date.touched).toBe(true);
    button('2026-06-02').click();
    await fixture.whenStable();
    expect(component.date.value).toBe('2026-06-12');
  });

  it('selects ranges and multiple dates', async () => {
    const { fixture, button, cell, component } = await setup();
    component.mode.set('range');
    component.date.setValue([]);
    await fixture.whenStable();
    button('2026-06-15').click();
    await fixture.whenStable();
    expect(component.completed()).toBeNull();
    button('2026-06-12').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-06-12', '2026-06-15']);
    expect(component.completed()).toEqual(['2026-06-12', '2026-06-15']);
    expect(cell('2026-06-12').getAttribute('data-vc-date-selected')).toBe('first');
    expect(cell('2026-06-13').getAttribute('data-vc-date-selected')).toBe('middle');
    expect(cell('2026-06-15').getAttribute('data-vc-date-selected')).toBe('last');

    component.mode.set('multiple');
    component.date.setValue([]);
    await fixture.whenStable();
    button('2026-06-20').click();
    await fixture.whenStable();
    button('2026-06-18').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-06-18', '2026-06-20']);
    button('2026-06-20').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-06-18']);
  });

  it('keeps the view when a range ends in another month', async () => {
    const { fixture, host, button, component } = await setup();
    component.mode.set('range');
    component.date.setValue([]);
    await fixture.whenStable();
    button('2026-06-28').click();
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!.click();
    await fixture.whenStable();
    button('2026-07-03').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-06-28', '2026-07-03']);
    expect(host.querySelector('[data-vc="month"]')!.textContent).toBe('July');
    expect(button('2026-07-03').tabIndex).toBe(0);

    component.mode.set('multiple');
    component.date.setValue(['2026-07-03']);
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!.click();
    await fixture.whenStable();
    button('2026-08-12').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-07-03', '2026-08-12']);
    expect(host.querySelector('[data-vc="month"]')!.textContent).toBe('August');
    expect(button('2026-08-12').tabIndex).toBe(0);
  });

  it('marks the control touched when focus leaves the calendar', async () => {
    const { fixture, button, component } = await setup();
    const outside = document.createElement('button');
    document.body.append(outside);
    button('2026-06-10').dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: button('2026-06-11') }),
    );
    await fixture.whenStable();
    expect(component.date.touched).toBe(false);
    button('2026-06-11').dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }),
    );
    await fixture.whenStable();
    expect(component.date.touched).toBe(true);
    outside.remove();
  });

  it('moves focus with the keyboard and changes month', async () => {
    const { fixture, host, button } = await setup();
    const key = async (iso: string, name: string, shiftKey = false) => {
      button(iso).dispatchEvent(
        new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true }),
      );
      await fixture.whenStable();
    };
    button('2026-06-10').focus();
    await key('2026-06-10', 'ArrowRight');
    expect(document.activeElement).toBe(button('2026-06-11'));
    await key('2026-06-11', 'ArrowDown');
    expect(document.activeElement).toBe(button('2026-06-18'));
    await key('2026-06-18', 'Home');
    expect(document.activeElement).toBe(button('2026-06-15'));
    await key('2026-06-15', 'End');
    expect(document.activeElement).toBe(button('2026-06-21'));
    await key('2026-06-21', 'PageDown');
    expect(host.querySelector('[data-vc="month"]')!.textContent).toBe('July');
    expect(document.activeElement).toBe(button('2026-07-21'));
    expect(button('2026-07-21').tabIndex).toBe(0);
    await key('2026-07-21', 'PageUp', true);
    expect(host.querySelector('[data-vc="year"]')!.textContent).toBe('2025');
    expect(document.activeElement).toBe(button('2025-07-21'));
  });

  it('changes month with the arrow buttons and shows several months', async () => {
    const { fixture, host, component } = await setup();
    host.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!.click();
    await fixture.whenStable();
    expect(host.querySelector('[data-vc="month"]')!.textContent).toBe('July');
    expect(host.querySelector('[data-vc-arrow="prev"]')!.getAttribute('aria-label')).toBe(
      'Previous month',
    );
    component.months.set(2);
    await fixture.whenStable();
    const months = Array.from(host.querySelectorAll('[data-vc="month"]')).map((m) => m.textContent);
    expect(months).toEqual(['July', 'August']);
    // Days of neighboring months are hidden when several months are shown.
    expect(host.querySelector('[data-vc-date-month]')).toBeNull();
  });

  it('keeps focus on the arrow buttons after a key that stays on the same date', async () => {
    const { fixture, host, button } = await setup();
    // 2026-06-15 is a Monday, so Home keeps it.
    button('2026-06-15').focus();
    await fixture.whenStable();
    button('2026-06-15').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    await fixture.whenStable();
    expect(document.activeElement).toBe(button('2026-06-15'));
    const next = host.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!;
    next.focus();
    next.click();
    await fixture.whenStable();
    expect(host.querySelector('[data-vc="month"]')!.textContent).toBe('July');
    expect(document.activeElement).toBe(next);
  });

  it('shows week numbers as row headers', async () => {
    @Component({
      imports: [BsCalendar],
      template: `<div
        bsCalendar
        locale="en-US"
        value="2027-01-10"
        [weekNumbers]="weekNumbers()"
        [weekNumbering]="numbering()"
        [firstWeekday]="firstWeekday()"></div>`,
    })
    class WeekHost {
      readonly weekNumbers = signal(false);
      readonly numbering = signal<BsWeekNumbering>('iso');
      readonly firstWeekday = signal(1);
    }
    const fixture = TestBed.createComponent(WeekHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const numbers = () =>
      Array.from(host.querySelectorAll('[data-vc-week-number]')).map((n) => n.textContent.trim());
    const row = () => host.querySelector<HTMLElement>('[data-vc-dates="row"]')!;
    expect(numbers()).toEqual([]);
    expect(host.querySelector('[data-vc-week-numbers="title"]')).toBeNull();
    expect(row().style.gridTemplateColumns).toBe('');

    fixture.componentInstance.weekNumbers.set(true);
    await fixture.whenStable();
    // 2027 starts on a Friday, so its first days are in ISO week 53 of 2026.
    expect(numbers()).toEqual(['53', '1', '2', '3', '4']);
    const title = host.querySelector('[data-vc-week-numbers="title"]')!;
    expect(title.getAttribute('role')).toBe('columnheader');
    expect(title.getAttribute('aria-label')).toBe('Week');
    expect(row().firstElementChild!.getAttribute('role')).toBe('rowheader');
    expect(row().style.gridTemplateColumns).toBe('1.5rem repeat(7, 1fr)');
    expect(host.querySelector<HTMLElement>('[data-vc="week"]')!.style.gridTemplateColumns).toBe(
      '1.5rem repeat(7, 1fr)',
    );

    fixture.componentInstance.firstWeekday.set(0);
    fixture.componentInstance.numbering.set('simple');
    await fixture.whenStable();
    expect(numbers()).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('keeps a tab stop in the grid after picking a day of the previous month', async () => {
    @Component({
      imports: [BsCalendar],
      template: `<div bsCalendar locale="en-US" selectionMode="multiple" [(value)]="value"></div>`,
    })
    class MultipleHost {
      readonly value = signal<BsDateValue>(['2026-01-10']);
    }
    const fixture = TestBed.createComponent(MultipleHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const button = (iso: string) =>
      host.querySelector<HTMLButtonElement>(`[data-vc-date-btn][data-iso="${iso}"]`)!;
    button('2025-12-30').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual(['2025-12-30', '2026-01-10']);
    expect(host.querySelector('[data-vc="month"]')!.textContent).toBe('January');
    const stops = host.querySelectorAll<HTMLButtonElement>('[data-vc-date-btn][tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect(stops[0]).toBe(button('2026-01-10'));
  });
});
