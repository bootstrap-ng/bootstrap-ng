import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsLiveAnnouncer } from '../util/announcer';
import { BsToast, BsToastClose } from './toast';

@Component({
  imports: [BsToast, BsToastClose],
  template: `
    <div
      bsToast
      style="position: fixed; top: -1000px"
      [(open)]="open"
      [autohide]="autohide()"
      [delay]="50"
      [live]="live()"
      (shown)="shown = shown + 1"
      (hidden)="hidden = hidden + 1">
      <div class="toast-header">
        <button type="button" bsToastClose>Close</button>
      </div>
      <div class="toast-body">Hello</div>
    </div>
  `,
})
class Host {
  readonly open = signal(false);
  readonly autohide = signal(true);
  readonly live = signal<'polite' | 'assertive'>('polite');
  shown = 0;
  hidden = 0;
}

// The toasts sit off screen so the test runner's pointer never pauses them.
describe('BsToast', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const toast: HTMLElement = fixture.nativeElement.querySelector('.toast');
    return { fixture, host: fixture.componentInstance, toast };
  }

  it('announces its text through the live announcer when shown', async () => {
    const { fixture, host, toast } = await setup();
    const announce = vi.spyOn(TestBed.inject(BsLiveAnnouncer), 'announce');
    // The toast is not a live region itself: it would be missed when it appears.
    expect(toast.getAttribute('role')).toBeNull();
    expect(toast.getAttribute('aria-live')).toBeNull();
    host.autohide.set(false);
    host.live.set('assertive');
    host.open.set(true);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.shown).toBe(1));
    expect(announce).toHaveBeenCalledWith(expect.stringContaining('Hello'), 'assertive');
  });

  it('shows and hides itself after the delay', async () => {
    const { fixture, host, toast } = await setup();
    host.open.set(true);
    await fixture.whenStable();
    expect(toast.classList).toContain('show');
    await vi.waitFor(() => expect(host.shown).toBe(1));
    await vi.waitFor(() => expect(host.open()).toBe(false));
    await fixture.whenStable();
    expect(toast.classList).not.toContain('show');
    await vi.waitFor(() => expect(host.hidden).toBe(1));
  });

  it('stays open without autohide', async () => {
    const { fixture, host } = await setup();
    host.autohide.set(false);
    host.open.set(true);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.shown).toBe(1));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(host.open()).toBe(true);
  });

  it('pauses the timer while the pointer is over it', async () => {
    const { fixture, host, toast } = await setup();
    host.open.set(true);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.shown).toBe(1));
    toast.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(host.open()).toBe(true);
    toast.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    await vi.waitFor(() => expect(host.open()).toBe(false));
  });

  it('closes from a bsToastClose element', async () => {
    const { fixture, host, toast } = await setup();
    host.autohide.set(false);
    host.open.set(true);
    await fixture.whenStable();
    toast.querySelector('button')!.click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
    expect(toast.classList).not.toContain('show');
  });
  it('returns focus to where it came from when closed from inside', async () => {
    const { fixture, host, toast } = await setup();
    const outside = document.createElement('button');
    document.body.append(outside);
    host.autohide.set(false);
    host.open.set(true);
    await fixture.whenStable();
    outside.focus();
    const close = toast.querySelector('button')!;
    close.focus();
    close.click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);

    // An origin that can no longer take focus falls back to a neighbouring control.
    host.open.set(true);
    await fixture.whenStable();
    outside.focus();
    close.focus();
    outside.disabled = true;
    const next = document.createElement('button');
    document.body.append(next);
    close.click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(next);
    outside.remove();
    next.remove();
  });

  it('resumes autohide when shown again after closing while focused', async () => {
    const { fixture, host, toast } = await setup();
    host.open.set(true);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.shown).toBe(1));
    // Browsers do not always fire focusout when a focused toast is hidden.
    toast.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    toast.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    host.open.set(false);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.hidden).toBe(1));
    host.open.set(true);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.shown).toBe(2));
    await vi.waitFor(() => expect(host.open()).toBe(false));
  });

  it('does nothing once destroyed during its transition', async () => {
    const { fixture, host, toast } = await setup();
    const announce = vi.spyOn(TestBed.inject(BsLiveAnnouncer), 'announce');
    const warn = vi.spyOn(console, 'warn');
    toast.style.transition = 'opacity 0.05s';
    host.open.set(true);
    await fixture.whenStable();
    fixture.destroy();
    // Longer than the transition plus the 50ms delay.
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(announce).not.toHaveBeenCalled();
    expect(host.shown).toBe(0);
    expect(warn).not.toHaveBeenCalled();
  });
});
