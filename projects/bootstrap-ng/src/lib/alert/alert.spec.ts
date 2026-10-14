import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsTheme } from '../util/theme';
import { BsAlert } from './alert';

@Component({
  imports: [BsAlert],
  template: `
    <div
      bsAlert
      class="extra"
      [theme]="theme()"
      [dismissible]="dismissible()"
      (closed)="closed = true">
      <p>Hello</p>
    </div>
  `,
})
class Host {
  readonly theme = signal<BsTheme | null>('success');
  readonly dismissible = signal(false);
  closed = false;
}

@Component({
  imports: [BsAlert],
  template: `
    <button type="button" class="before">Before</button>
    <div bsAlert dismissible class="first" role="status">First</div>
    <button type="button" class="after">After</button>
    <div bsAlert dismissible class="last">Last</div>
  `,
})
class FocusHost {}

describe('BsAlert', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement.querySelector('[bsAlert]');
    return { fixture, el };
  }

  it('renders Bootstrap classes and keeps user classes', async () => {
    const { el } = await setup();
    expect(el.classList).toContain('alert');
    expect(el.classList).toContain('theme-success');
    expect(el.classList).toContain('extra');
    expect(el.getAttribute('role')).toBe('alert');
  });

  it('updates the theme class', async () => {
    const { fixture, el } = await setup();
    fixture.componentInstance.theme.set('danger');
    await fixture.whenStable();
    expect(el.classList).toContain('theme-danger');
    expect(el.classList).not.toContain('theme-success');
  });

  it('only renders a close button when dismissible', async () => {
    const { fixture, el } = await setup();
    expect(el.querySelector('.btn-close')).toBeNull();
    fixture.componentInstance.dismissible.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.btn-close')?.getAttribute('aria-label')).toBe('Close');
  });

  it('hides itself and emits closed when the close button is clicked', async () => {
    const { fixture, el } = await setup();
    fixture.componentInstance.dismissible.set(true);
    await fixture.whenStable();
    (el.querySelector('.btn-close') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(fixture.componentInstance.closed).toBe(true));
    await fixture.whenStable();
    expect(el.hidden).toBe(true);
  });

  it('keeps a role set on the element, for alerts present when the page loads', async () => {
    const fixture = TestBed.createComponent(FocusHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.first')!.getAttribute('role')).toBe('status');
    expect(root.querySelector('.last')!.getAttribute('role')).toBe('alert');
  });

  it('moves focus out of the alert when it closes', async () => {
    const fixture = TestBed.createComponent(FocusHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const first = root.querySelector<HTMLButtonElement>('.first .btn-close')!;
    first.focus();
    first.click();
    expect(document.activeElement).toBe(root.querySelector('.after'));
    // At the end of the page, focus goes back to the previous control.
    const last = root.querySelector<HTMLButtonElement>('.last .btn-close')!;
    last.focus();
    last.click();
    expect(document.activeElement).toBe(root.querySelector('.after'));
  });
});
