import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsDialog, BsDialogClose } from '../dialog/dialog';
import { BsDrawer, BsDrawerToggle } from './drawer';

@Component({
  imports: [BsDrawer, BsDrawerToggle, BsDialogClose],
  template: `
    <button type="button" [bsDrawerToggle]="d">Toggle</button>
    <a href="#" [bsDrawerToggle]="d">Link</a>
    <dialog
      bsDrawer
      #d="bsDrawer"
      [(open)]="open"
      [placement]="placement()"
      [responsive]="responsive()"
      [scroll]="scroll()"
      [backdrop]="backdrop()"
      (hidden)="hidden = hidden + 1"
      (dismissed)="dismissed = $event">
      <div class="drawer-body">Body</div>
      <button type="button" bsDrawerClose>Close</button>
    </dialog>
  `,
})
class Host {
  readonly open = signal(false);
  readonly placement = signal<'start' | 'end' | 'top' | 'bottom' | 'fullscreen'>('start');
  readonly responsive = signal<'md' | null>(null);
  readonly scroll = signal(false);
  readonly backdrop = signal<boolean | 'static'>(true);
  hidden = 0;
  dismissed: string | null = null;
}

@Component({
  imports: [BsDrawer, BsDialog],
  template: `
    <dialog bsDialog [(open)]="dialogOpen"></dialog>
    <dialog bsDrawer scroll [(open)]="drawerOpen"></dialog>
  `,
})
class ScrollHost {
  readonly dialogOpen = signal(false);
  readonly drawerOpen = signal(false);
}

describe('BsDrawer', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const drawer: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, host: fixture.componentInstance, drawer, toggle };
  }

  afterEach(() => document.documentElement.classList.remove('dialog-open'));

  it('sets placement and responsive classes', async () => {
    const { fixture, host, drawer } = await setup();
    expect(drawer.className).toBe('drawer drawer-start');
    host.placement.set('end');
    host.responsive.set('md');
    await fixture.whenStable();
    expect(drawer.classList).toContain('md:drawer');
    expect(drawer.classList).toContain('drawer-end');
    expect(drawer.classList).not.toContain('drawer');
  });

  it('opens as a modal from its toggle and locks page scroll', async () => {
    const { fixture, drawer, toggle, host } = await setup();
    expect(toggle.getAttribute('aria-controls')).toBe(drawer.id);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    expect(drawer.matches(':modal')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(document.documentElement.classList).toContain('dialog-open');
  });

  it('opens from a link toggle with Space, like a button', async () => {
    const { fixture, host } = await setup();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('role')).toBe('button');
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    link.dispatchEvent(space);
    await fixture.whenStable();
    expect(space.defaultPrevented).toBe(true);
    expect(host.open()).toBe(true);
  });

  it('opens inline without a backdrop when scroll is on', async () => {
    const { fixture, host, drawer } = await setup();
    host.scroll.set(true);
    host.backdrop.set(false);
    host.open.set(true);
    await fixture.whenStable();
    expect(drawer.open).toBe(true);
    expect(drawer.matches(':modal')).toBe(false);
    expect(document.documentElement.classList).not.toContain('dialog-open');
  });

  it('closes from a bsDrawerClose element', async () => {
    const { fixture, host, drawer } = await setup();
    host.open.set(true);
    await fixture.whenStable();
    (drawer.querySelector('[bsDrawerClose]') as HTMLButtonElement).click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.hidden).toBe(1));
    expect(drawer.open).toBe(false);
    expect(host.open()).toBe(false);
  });

  it('closes on Escape and reports the reason', async () => {
    const { fixture, host, drawer } = await setup();
    host.open.set(true);
    await fixture.whenStable();
    drawer.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();
    expect(host.dismissed).toBe('escape');
    expect(host.open()).toBe(false);
  });

  it('unlocks page scroll when only a scrolling drawer stays open', async () => {
    const fixture = TestBed.createComponent(ScrollHost);
    const host = fixture.componentInstance;
    host.dialogOpen.set(true);
    await fixture.whenStable();
    host.drawerOpen.set(true);
    await fixture.whenStable();
    const drawer: HTMLDialogElement = fixture.nativeElement.querySelector('dialog[bsDrawer]');
    expect(drawer.matches(':modal')).toBe(true);
    expect(document.documentElement.classList).toContain('dialog-open');
    host.dialogOpen.set(false);
    await fixture.whenStable();
    await vi.waitFor(() =>
      expect(fixture.nativeElement.querySelector('dialog[bsDialog]').open).toBe(false),
    );
    expect(document.documentElement.classList).not.toContain('dialog-open');
  });
});
