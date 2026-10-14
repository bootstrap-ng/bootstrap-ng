import { Component, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsToastContext } from './toaster';
import { BsToaster } from './toaster';

@Component({
  template: `<ng-template #tpl let-toast
    ><button type="button" (click)="toast.hide()">Undo</button></ng-template
  >`,
})
class Host {
  readonly tpl = viewChild.required<TemplateRef<BsToastContext>>('tpl');
}

describe('BsToaster', () => {
  const container = () => document.querySelector<HTMLElement>('.toast-container');
  const toasts = () =>
    Array.from(document.querySelectorAll<HTMLElement>('.toast-container .toast'));

  afterEach(() => document.querySelector('bs-toaster')?.remove());

  it('adds a container and shows a toast with a title', async () => {
    const toaster = TestBed.inject(BsToaster);
    const ref = toaster.show({ title: 'Saved', body: 'All good', theme: 'success' });
    await vi.waitFor(() => expect(toasts()[0]?.classList).toContain('show'));
    const toast = toasts()[0];
    expect(container()!.classList).toContain('position-fixed');
    expect(container()!.classList).toContain('bottom-0');
    expect(toast.classList).toContain('theme-success');
    await vi.waitFor(() =>
      expect(document.querySelector('[aria-live="polite"]')!.textContent).toContain('All good'),
    );
    expect(toast.querySelector('.toast-header strong')!.textContent).toBe('Saved');
    expect(toast.querySelector('.toast-body')!.textContent.trim()).toBe('All good');
    ref.hide();
    await ref.afterHidden;
    await vi.waitFor(() => expect(toasts().length).toBe(0));
  });

  it('removes a toast closed from its close button', async () => {
    const toaster = TestBed.inject(BsToaster);
    const ref = toaster.show({ body: 'Bye', live: 'assertive', autohide: false });
    await vi.waitFor(() => expect(toasts().length).toBe(1));
    await vi.waitFor(() =>
      expect(document.querySelector('[aria-live="assertive"]')!.textContent).toBe('Bye'),
    );
    toasts()[0].querySelector<HTMLButtonElement>('.btn-close')!.click();
    await ref.afterHidden;
    await vi.waitFor(() => expect(toasts().length).toBe(0));
  });

  it('hides on its own after the delay', async () => {
    const toaster = TestBed.inject(BsToaster);
    const ref = toaster.show({ body: 'Quick', delay: 20 });
    // Without Bootstrap's CSS the toast renders under the test runner's pointer,
    // which would pause it.
    document.querySelector<HTMLElement>('bs-toaster')!.style.cssText =
      'position: fixed; top: -1000px';
    await ref.afterHidden;
    await vi.waitFor(() => expect(toasts().length).toBe(0));
  });

  it('renders a template body with the toast as context', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const toaster = TestBed.inject(BsToaster);
    toaster.setPlacement('top-center');
    const ref = toaster.show({ body: fixture.componentInstance.tpl(), autohide: false });
    await vi.waitFor(() => expect(toasts().length).toBe(1));
    expect(container()!.classList).toContain('translate-middle-x');
    toasts()[0].querySelector<HTMLButtonElement>('.toast-body button')!.click();
    await ref.afterHidden;
  });

  it('clears every toast', async () => {
    const toaster = TestBed.inject(BsToaster);
    const a = toaster.show({ body: 'A', autohide: false });
    const b = toaster.show({ body: 'B', autohide: false });
    await vi.waitFor(() => expect(toasts().length).toBe(2));
    toaster.clear();
    await Promise.all([a.afterHidden, b.afterHidden]);
  });

  it('never opens a toast hidden right after it was shown', async () => {
    const toaster = TestBed.inject(BsToaster);
    const ref = toaster.show({ body: 'Gone', autohide: false });
    ref.hide();
    await ref.afterHidden;
    await vi.waitFor(() => expect(toasts().length).toBe(0));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(toasts().length).toBe(0);
  });

  it('clears toasts shown in the same tick', async () => {
    const toaster = TestBed.inject(BsToaster);
    const a = toaster.show({ body: 'A', autohide: false });
    toaster.clear();
    await a.afterHidden;
    await vi.waitFor(() => expect(toasts().length).toBe(0));
  });
  it('removes a toast hidden after it opened but before it rendered', async () => {
    const toaster = TestBed.inject(BsToaster);
    const ref = toaster.show({ body: 'Blink', autohide: false });
    // The toaster opens the toast in a timeout; run right after it, before rendering.
    await new Promise((resolve) => setTimeout(resolve));
    ref.hide();
    const settled = await Promise.race([
      ref.afterHidden.then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), 200)),
    ]);
    expect(settled).toBe(true);
    await vi.waitFor(() => expect(toasts().length).toBe(0));
  });
});
