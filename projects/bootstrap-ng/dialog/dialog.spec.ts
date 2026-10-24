import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { BsDialog, BsDialogClose } from './dialog';

@Component({
  imports: [BsDialog, BsDialogClose],
  template: `
    <dialog
      bsDialog
      #d="bsDialog"
      [(open)]="open"
      [backdrop]="backdrop()"
      [keyboard]="keyboard()"
      [modal]="modal()"
      [style.transition]="transition()"
      (shown)="shown = shown + 1"
      (hidden)="hidden = hidden + 1"
      (dismissed)="dismissed = $event">
      <div class="dialog-body">Body</div>
      <button type="button" class="handles-escape" (keydown.escape)="$event.preventDefault()">
        Menu
      </button>
      <button type="button" bsDialogClose>Close</button>
    </dialog>
  `,
})
class Host {
  readonly open = signal(false);
  readonly backdrop = signal<boolean | 'static'>(true);
  readonly keyboard = signal(true);
  readonly modal = signal(true);
  readonly transition = signal<string | null>(null);
  shown = 0;
  hidden = 0;
  dismissed: string | null = null;
}

@Component({
  imports: [BsDialog],
  template: `
    <dialog bsDialog [(open)]="outerOpen" keyboard="false" (dismissed)="outerDismissed = true">
      <dialog bsDialog [(open)]="innerOpen">
        <button type="button">Inner</button>
      </dialog>
    </dialog>
  `,
})
class NestedHost {
  readonly outerOpen = signal(false);
  readonly innerOpen = signal(false);
  outerDismissed = false;
}

describe('BsDialog', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    return { fixture, host: fixture.componentInstance, dialog };
  }

  afterEach(() => document.documentElement.classList.remove('dialog-open'));

  it('opens as a modal and locks page scroll', async () => {
    const { fixture, host, dialog } = await setup();
    expect(dialog.classList).toContain('dialog');
    host.open.set(true);
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.matches(':modal')).toBe(true);
    expect(document.documentElement.classList).toContain('dialog-open');
  });

  it('opens inline when modal is false', async () => {
    const { fixture, host, dialog } = await setup();
    host.modal.set(false);
    host.open.set(true);
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.matches(':modal')).toBe(false);
    expect(dialog.classList).toContain('dialog-nonmodal');
  });

  it('closes from a bsDialogClose element', async () => {
    const { fixture, host, dialog } = await setup();
    host.open.set(true);
    await fixture.whenStable();
    (dialog.querySelector('[bsDialogClose]') as HTMLButtonElement).click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.hidden).toBe(1));
    expect(dialog.open).toBe(false);
    expect(host.open()).toBe(false);
    expect(document.documentElement.classList).not.toContain('dialog-open');
  });

  it('closes on Escape unless keyboard is false', async () => {
    const { fixture, host, dialog } = await setup();
    host.keyboard.set(false);
    host.open.set(true);
    await fixture.whenStable();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();
    expect(host.open()).toBe(true);

    host.keyboard.set(true);
    await fixture.whenStable();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();
    expect(host.open()).toBe(false);
    expect(host.dismissed).toBe('escape');
  });

  it('stays open on repeated real Escape presses when keyboard is false', async () => {
    const { fixture, host, dialog } = await setup();
    host.keyboard.set(false);
    host.open.set(true);
    await fixture.whenStable();
    for (let i = 0; i < 3; i++) {
      // A real key press, because synthetic events skip the browser's close request handling.
      // eslint-disable-next-line @angular-eslint/no-experimental -- Vitest's API, not Angular's
      await userEvent.keyboard('{Escape}');
      await fixture.whenStable();
    }
    expect(dialog.open).toBe(true);
    expect(host.open()).toBe(true);
  });

  it('closes on backdrop click unless the backdrop is static', async () => {
    const { fixture, host, dialog } = await setup();
    host.backdrop.set('static');
    host.open.set(true);
    await fixture.whenStable();
    dialog.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    expect(dialog.classList).toContain('dialog-static');

    host.backdrop.set(true);
    await fixture.whenStable();
    (dialog.querySelector('.dialog-body') as HTMLElement).click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    dialog.click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
    expect(host.dismissed).toBe('backdrop');
  });

  it('syncs state when the native dialog closes on its own', async () => {
    const { fixture, host, dialog } = await setup();
    host.open.set(true);
    await fixture.whenStable();
    dialog.close();
    await vi.waitFor(() => expect(host.open()).toBe(false));
    expect(host.hidden).toBe(1);
  });

  it('stays open when reopened during its exit transition', async () => {
    const { fixture, host, dialog } = await setup();
    host.transition.set('opacity 0.2s');
    host.open.set(true);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.shown).toBe(1));
    host.open.set(false);
    await fixture.whenStable();
    host.open.set(true);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(dialog.open).toBe(true);
    expect(dialog.matches(':modal')).toBe(true);
    expect(dialog.classList).not.toContain('hiding');
    expect(document.documentElement.classList).toContain('dialog-open');
    expect(host.hidden).toBe(0);
  });

  it('keeps an inline dialog styled when reopened during its exit transition', async () => {
    const { fixture, host, dialog } = await setup();
    host.transition.set('opacity 0.2s');
    host.modal.set(false);
    host.open.set(true);
    await fixture.whenStable();
    host.open.set(false);
    await fixture.whenStable();
    host.open.set(true);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(dialog.open).toBe(true);
    expect(dialog.classList).toContain('dialog-nonmodal');
    expect(host.hidden).toBe(0);

    host.open.set(false);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.hidden).toBe(1));
    expect(dialog.open).toBe(false);
  });

  it('does not emit shown when hidden before its enter transition ends', async () => {
    const { fixture, host, dialog } = await setup();
    host.transition.set('opacity 0.2s');
    host.open.set(true);
    await fixture.whenStable();
    host.open.set(false);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.hidden).toBe(1));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(dialog.open).toBe(false);
    expect(host.shown).toBe(0);
  });

  it('ignores a click that starts inside the dialog and ends on the backdrop', async () => {
    const { fixture, host, dialog } = await setup();
    host.open.set(true);
    await fixture.whenStable();
    const body = dialog.querySelector('.dialog-body') as HTMLElement;
    body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    dialog.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);

    dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    dialog.click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
  });

  it('closes the dialog when destroyed', async () => {
    const { fixture, host, dialog } = await setup();
    host.open.set(true);
    await fixture.whenStable();
    fixture.destroy();
    expect(dialog.open).toBe(false);
    expect(document.documentElement.classList).not.toContain('dialog-open');
  });

  it('ignores an Escape that content inside the dialog already handled', async () => {
    const { fixture, host, dialog } = await setup();
    host.modal.set(false);
    host.open.set(true);
    await fixture.whenStable();
    const button = dialog.querySelector<HTMLButtonElement>('.handles-escape')!;
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    expect(dialog.open).toBe(true);
    expect(host.dismissed).toBeNull();
  });

  it('leaves an Escape from a nested dialog to that dialog', async () => {
    const fixture = TestBed.createComponent(NestedHost);
    const host = fixture.componentInstance;
    host.outerOpen.set(true);
    await fixture.whenStable();
    host.innerOpen.set(true);
    await fixture.whenStable();
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    fixture.nativeElement.querySelector('dialog dialog button').dispatchEvent(event);
    await fixture.whenStable();
    expect(event.defaultPrevented).toBe(false);
    expect(host.outerDismissed).toBe(false);
    const outer: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    expect(outer.classList).not.toContain('dialog-static');
  });

  it('does not emit hidden after it is destroyed during its exit transition', async () => {
    const warn = vi.spyOn(console, 'warn');
    const { fixture, host } = await setup();
    host.transition.set('opacity 0.2s');
    host.open.set(true);
    await fixture.whenStable();
    host.open.set(false);
    await fixture.whenStable();
    fixture.destroy();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
