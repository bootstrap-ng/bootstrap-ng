import { Component, LOCALE_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsAlert, provideBsAlertConfig } from '../alert/alert';
import { BsDialogService } from '../dialog/dialog-service';
import { provideBsDialogConfig } from '../dialog/dialog';
import { provideBsDrawerConfig } from '../drawer/drawer';
import { BsCalendar, provideBsCalendarConfig } from '../forms/calendar';
import { BsDatepicker, provideBsDatepickerConfig } from '../forms/datepicker';
import { BsPagination, provideBsPaginationConfig } from '../pagination/pagination';
import { BsToaster } from '../toast/toaster';
import { provideBsToastConfig } from '../toast/toast';
import { BsTooltip, provideBsTooltipConfig } from '../tooltip/tooltip';
import { BsPopover } from '../popover/popover';

@Component({
  imports: [BsAlert],
  template: `
    <div bsAlert class="default">Default</div>
    <div bsAlert class="own" closeLabel="Own" [animation]="true">Own</div>
  `,
})
class AlertHost {}

@Component({
  imports: [BsAlert],
  providers: [provideBsAlertConfig({ closeLabel: 'Schließen' })],
  template: `<div bsAlert>Nested</div>`,
})
class NestedAlertHost {}

@Component({
  imports: [BsPagination],
  template: `<nav bsPagination aria-label="Pages" [pageCount]="3"></nav>`,
})
class PaginationHost {}

@Component({
  imports: [BsTooltip, BsPopover],
  template: `
    <button type="button" bsTooltip="Tip">Tip</button>
    <button type="button" bsPopover="Body">Popover</button>
  `,
})
class TipHost {}

@Component({
  imports: [BsCalendar],
  template: `
    <div bsCalendar class="default"></div>
    <div bsCalendar class="own" locale="en-US"></div>
  `,
})
class CalendarHost {}

@Component({
  imports: [BsDatepicker],
  template: `<button type="button" bsDatepicker [(value)]="value">Date</button>`,
})
class DatepickerHost {
  readonly value = signal<string | null>('2026-03-05');
}

describe('component config', () => {
  afterEach(() => {
    document.querySelectorAll('dialog, bs-toaster').forEach((el) => el.remove());
  });

  it('sets input defaults, and inputs win over them', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideBsAlertConfig({ dismissible: true, closeLabel: 'Fermer', animation: false }),
      ],
    });
    const fixture = TestBed.createComponent(AlertHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const def = root.querySelector('.default')!;
    expect(def.querySelector('.btn-close')?.getAttribute('aria-label')).toBe('Fermer');
    expect(def.classList).toContain('alert-instant');
    const own = root.querySelector('.own')!;
    expect(own.querySelector('.btn-close')?.getAttribute('aria-label')).toBe('Own');
    expect(own.classList).not.toContain('alert-instant');
  });

  it('merges component providers over the app config', async () => {
    TestBed.configureTestingModule({
      providers: [provideBsAlertConfig({ dismissible: true, closeLabel: 'Fermer' })],
    });
    const fixture = TestBed.createComponent(NestedAlertHost);
    await fixture.whenStable();
    const close = (fixture.nativeElement as HTMLElement).querySelector('.btn-close');
    expect(close?.getAttribute('aria-label')).toBe('Schließen');
  });

  it('keeps the built-in defaults without a config', async () => {
    const fixture = TestBed.createComponent(PaginationHost);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Previous');
    expect(text).toContain('Next');
  });

  it('translates pagination labels', async () => {
    TestBed.configureTestingModule({
      providers: [provideBsPaginationConfig({ previousText: 'Précédent', nextText: 'Suivant' })],
    });
    const fixture = TestBed.createComponent(PaginationHost);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Précédent');
    expect(text).toContain('Suivant');
  });

  it('configures tooltips without changing popovers', async () => {
    TestBed.configureTestingModule({
      providers: [provideBsTooltipConfig({ placement: 'bottom', trigger: 'click', delay: 50 })],
    });
    const fixture = TestBed.createComponent(TipHost);
    await fixture.whenStable();
    const tooltip = fixture.debugElement.children[0].injector.get(BsTooltip);
    const popover = fixture.debugElement.children[1].injector.get(BsPopover);
    expect(tooltip.placement()).toBe('bottom');
    expect(tooltip.trigger()).toBe('click');
    expect(tooltip.delay()).toBe(50);
    expect(popover.placement()).toBe('top');
    expect(popover.delay()).toBe(0);
  });

  it('formats calendars in LOCALE_ID by default', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }] });
    const fixture = TestBed.createComponent(CalendarHost);
    await fixture.whenStable();
    const [def, own] = fixture.debugElement.children.map((child) => child.injector.get(BsCalendar));
    expect(def.locale()).toBe('de-DE');
    expect(own.locale()).toBe('en-US');
    const weekday = (fixture.nativeElement as HTMLElement).querySelector(
      '.default [data-vc-week-day]',
    );
    expect(weekday?.textContent?.trim()).toBe('Mo');
  });

  it('lets the calendar config override LOCALE_ID', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'de-DE' },
        provideBsCalendarConfig({ locale: 'fr-FR', firstWeekday: 0 }),
      ],
    });
    const fixture = TestBed.createComponent(CalendarHost);
    await fixture.whenStable();
    const calendar = fixture.debugElement.children[0].injector.get(BsCalendar);
    expect(calendar.locale()).toBe('fr-FR');
    expect(calendar.firstWeekday()).toBe(0);
  });

  it('falls back to the calendar config in datepickers', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'de-DE' },
        provideBsCalendarConfig({ firstWeekday: 0, weekNumbers: true }),
        provideBsDatepickerConfig({ firstWeekday: 6, dateFormat: { dateStyle: 'long' } }),
      ],
    });
    const fixture = TestBed.createComponent(DatepickerHost);
    await fixture.whenStable();
    const picker = fixture.debugElement.children[0].injector.get(BsDatepicker);
    expect(picker.locale()).toBe('de-DE');
    expect(picker.firstWeekday()).toBe(6);
    expect(picker.weekNumbers()).toBe(true);
    expect(picker.display()).toBe('5. März 2026');
  });

  it('applies dialog and drawer config to BsDialogService, under its options', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideBsDialogConfig({ backdrop: 'static', animation: false }),
        provideBsDrawerConfig({ placement: 'end' }),
      ],
    });
    const service = TestBed.inject(BsDialogService);
    service.open(AlertHost);
    service.open(AlertHost, { animation: true });
    service.openDrawer(AlertHost);
    await new Promise((resolve) => setTimeout(resolve));
    const [first, second] = Array.from(document.querySelectorAll<HTMLElement>('dialog.dialog'));
    const drawer = document.querySelector<HTMLElement>('dialog.drawer');
    expect(first.classList).toContain('dialog-instant');
    expect(second.classList).not.toContain('dialog-instant');
    expect(drawer?.classList).toContain('drawer-end');
    service.dismissAll();
  });

  it('applies toast config to BsToaster', async () => {
    TestBed.configureTestingModule({ providers: [provideBsToastConfig({ closeLabel: 'Fermer' })] });
    TestBed.inject(BsToaster).show({ body: 'Saved' });
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
    const close = document.querySelector('bs-toaster .btn-close');
    expect(close?.getAttribute('aria-label')).toBe('Fermer');
  });
});
