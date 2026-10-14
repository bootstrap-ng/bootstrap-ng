import { Component, inject, input, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsDialogClose } from './dialog-base';
import { BsDialogContext, BsDialogRef, BsDialogService } from './dialog-service';

@Component({
  imports: [BsDialogClose],
  template: `
    <div class="dialog-header">
      <h2 class="dialog-title">Delete {{ name() }}?</h2>
      <button type="button" class="dismiss" bsDialogClose>Cancel</button>
    </div>
    <div class="dialog-body">
      <button type="button" class="confirm" (click)="ref.close(true)">Delete</button>
    </div>
  `,
})
class ConfirmDialog {
  protected readonly ref = inject<BsDialogRef<boolean>>(BsDialogRef);
  readonly name = input('file');
}

@Component({
  template: `<ng-template #tpl let-ref
    ><div class="drawer-body">
      <button type="button" (click)="ref.close('picked')">Pick</button>
    </div></ng-template
  >`,
})
class Host {
  readonly tpl = viewChild.required<TemplateRef<BsDialogContext<string>>>('tpl');
}

describe('BsDialogService', () => {
  const dialog = () => document.querySelector<HTMLDialogElement>('bs-dialog-container dialog');

  afterEach(() => {
    TestBed.inject(BsDialogService).dismissAll();
  });

  it('opens a component, passes inputs and resolves with the close value', async () => {
    const dialogs = TestBed.inject(BsDialogService);
    const ref = dialogs.open<ConfirmDialog, boolean>(ConfirmDialog, {
      inputs: { name: 'report.pdf' },
      size: 'lg',
      scrollable: true,
      class: 'extra',
    });
    expect(ref.componentInstance).toBeInstanceOf(ConfirmDialog);
    await vi.waitFor(() => expect(dialog()!.open).toBe(true));
    const element = dialog()!;
    expect(element.matches(':modal')).toBe(true);
    expect(element.classList).toContain('dialog');
    expect(element.classList).toContain('dialog-lg');
    expect(element.classList).toContain('dialog-scrollable');
    expect(element.classList).toContain('extra');
    const title = element.querySelector('.dialog-title')!;
    expect(title.textContent).toBe('Delete report.pdf?');
    expect(title.id).toBeTruthy();
    expect(element.getAttribute('aria-labelledby')).toBe(title.id);
    element.querySelector<HTMLButtonElement>('.confirm')!.click();
    expect(await ref.result).toBe(true);
    expect(dialog()).toBeNull();
    expect(document.documentElement.classList).not.toContain('dialog-open');
  });

  it('resolves with undefined when dismissed from bsDialogClose', async () => {
    const ref = TestBed.inject(BsDialogService).open(ConfirmDialog);
    await vi.waitFor(() => expect(dialog()!.open).toBe(true));
    dialog()!.querySelector<HTMLButtonElement>('.dismiss')!.click();
    expect(await ref.result).toBeUndefined();
    expect(dialog()).toBeNull();
  });

  it('resolves with undefined when the backdrop is clicked', async () => {
    const ref = TestBed.inject(BsDialogService).open(ConfirmDialog);
    await vi.waitFor(() => expect(dialog()!.open).toBe(true));
    dialog()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(await ref.result).toBeUndefined();
  });

  it('keeps a static dialog open on a backdrop click', async () => {
    const ref = TestBed.inject(BsDialogService).open(ConfirmDialog, {
      backdrop: 'static',
      keyboard: false,
      animation: false,
    });
    await vi.waitFor(() => expect(dialog()!.open).toBe(true));
    expect(dialog()!.classList).toContain('dialog-instant');
    dialog()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(dialog()!.open).toBe(true);
    ref.dismiss();
    await ref.result;
  });

  it('uses the given label instead of the title', async () => {
    const dialogs = TestBed.inject(BsDialogService);
    const labelled = dialogs.open(ConfirmDialog, { ariaLabel: 'Confirm' });
    await vi.waitFor(() => expect(dialog()!.open).toBe(true));
    expect(dialog()!.getAttribute('aria-label')).toBe('Confirm');
    expect(dialog()!.hasAttribute('aria-labelledby')).toBe(false);
    labelled.dismiss();
    await labelled.result;

    const byId = dialogs.open(ConfirmDialog, { ariaLabelledBy: 'somewhere' });
    await vi.waitFor(() => expect(dialog()!.open).toBe(true));
    expect(dialog()!.getAttribute('aria-labelledby')).toBe('somewhere');
    byId.dismiss();
    await byId.result;
  });

  it('opens a template in a drawer with the ref as context', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const ref = TestBed.inject(BsDialogService).openDrawer(fixture.componentInstance.tpl(), {
      placement: 'end',
      ariaLabel: 'Options',
    });
    await vi.waitFor(() => expect(dialog()!.open).toBe(true));
    expect(dialog()!.classList).toContain('drawer');
    expect(dialog()!.classList).toContain('drawer-end');
    dialog()!.querySelector<HTMLButtonElement>('button')!.click();
    expect(await ref.result).toBe('picked');
  });

  it('removes a dialog closed before it opened', async () => {
    const ref = TestBed.inject(BsDialogService).open(ConfirmDialog);
    ref.close(false);
    expect(await ref.result).toBe(false);
    expect(dialog()).toBeNull();
  });

  it('dismisses every open dialog', async () => {
    const dialogs = TestBed.inject(BsDialogService);
    const a = dialogs.open(ConfirmDialog);
    const b = dialogs.openDrawer(ConfirmDialog);
    await vi.waitFor(() =>
      expect(document.querySelectorAll('bs-dialog-container dialog[open]').length).toBe(2),
    );
    dialogs.dismissAll();
    expect(await a.result).toBeUndefined();
    expect(await b.result).toBeUndefined();
    expect(document.querySelector('bs-dialog-container')).toBeNull();
  });

  it('removes a dialog closed after it opened but before it rendered open', async () => {
    const dialogs = TestBed.inject(BsDialogService);
    const ref = dialogs.open(ConfirmDialog);
    // Let the open timer run, but close before change detection renders it open.
    await new Promise<void>((resolve) =>
      setTimeout(() => {
        ref.close('early');
        resolve();
      }),
    );
    expect(await ref.result).toBe('early');
    expect(document.querySelector('bs-dialog-container')).toBeNull();

    // A later dismissAll still works.
    const next = dialogs.open(ConfirmDialog);
    await vi.waitFor(() => expect(dialog()!.open).toBe(true));
    dialogs.dismissAll();
    expect(await next.result).toBeUndefined();
    expect(document.querySelector('bs-dialog-container')).toBeNull();
  });

  it('keeps the dismissal when closed during the exit transition after Escape', async () => {
    const ref = TestBed.inject(BsDialogService).open(ConfirmDialog);
    await vi.waitFor(() => expect(dialog()!.open).toBe(true));
    const element = dialog()!;
    element.style.transition = 'opacity 0.2s';
    element.dispatchEvent(new Event('cancel', { cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    ref.close('late');
    expect(element.isConnected).toBe(true);
    expect(await ref.result).toBeUndefined();
    expect(dialog()).toBeNull();
  });
});
