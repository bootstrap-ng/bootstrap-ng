import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BsMenu, BsMenuToggle, BsSubmenu } from './menu';

@Component({
  imports: [BsMenu, BsMenuToggle],
  template: `
    <div style="position: fixed; top: -1000px">
      <button type="button" class="toggle" [bsMenuToggle]="menu">Menu</button>
      <div
        bsMenu
        #menu="bsMenu"
        [(open)]="open"
        [autoClose]="autoClose()"
        (shown)="shown = shown + 1"
        (hidden)="hidden = hidden + 1">
        <button type="button" class="menu-item">One</button>
        <button type="button" class="menu-item" disabled>Disabled</button>
        <button type="button" class="menu-item">Two</button>
        <button type="button" class="menu-item">Three</button>
        <input class="search" aria-label="Search" />
      </div>
      <button type="button" class="outside">Outside</button>
    </div>
  `,
})
class Host {
  readonly open = signal(false);
  readonly autoClose = signal<boolean | 'inside' | 'outside'>(true);
  shown = 0;
  hidden = 0;
}

@Component({
  imports: [BsMenu, BsMenuToggle],
  template: `
    <div style="position: fixed; top: -1000px">
      <a href="#menu" class="toggle" [bsMenuToggle]="menu">Menu</a>
      <div bsMenu #menu="bsMenu" open id="custom-menu">
        <a href="#one" class="menu-item">One</a>
      </div>
    </div>
  `,
})
class LinkToggleHost {}

describe('BsMenu', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      host: fixture.componentInstance,
      toggle: root.querySelector<HTMLButtonElement>('.toggle')!,
      menu: root.querySelector<HTMLElement>('.menu')!,
      items: Array.from(root.querySelectorAll<HTMLButtonElement>('.menu-item')),
      outside: root.querySelector<HTMLButtonElement>('.outside')!,
      search: root.querySelector<HTMLInputElement>('.search')!,
    };
  }

  function key(target: HTMLElement, key: string) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  it('toggles from the toggle and keeps ARIA in sync', async () => {
    const { fixture, host, toggle, menu } = await setup();
    expect(menu.id).toMatch(/^bs-menu-\d+$/);
    expect(toggle.getAttribute('aria-controls')).toBe(menu.id);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    expect(menu.classList).toContain('show');
    expect(toggle.classList).toContain('show');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    await vi.waitFor(() => expect(menu.getAttribute('data-bs-placement')).toBe('bottom-start'));

    toggle.click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
    expect(menu.classList).not.toContain('show');
    await vi.waitFor(() => expect(host.hidden).toBe(1));
  });

  it('closes on outside and inside clicks by default', async () => {
    const { fixture, host, toggle, items, outside } = await setup();
    toggle.click();
    await fixture.whenStable();
    outside.click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);

    toggle.click();
    await fixture.whenStable();
    items[0].click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
  });

  it('respects autoClose', async () => {
    const { fixture, host, toggle, items, outside } = await setup();
    host.autoClose.set('outside');
    toggle.click();
    await fixture.whenStable();
    items[0].click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    outside.click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);

    host.autoClose.set(false);
    toggle.click();
    await fixture.whenStable();
    outside.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
  });

  it('opens with ArrowDown and moves focus between enabled items', async () => {
    const { fixture, host, toggle, items } = await setup();
    toggle.focus();
    key(toggle, 'ArrowDown');
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(items[0]));

    key(items[0], 'ArrowDown');
    expect(document.activeElement).toBe(items[2]);
    key(items[2], 'End');
    expect(document.activeElement).toBe(items[3]);
    key(items[3], 'ArrowDown');
    expect(document.activeElement).toBe(items[0]);
    key(items[0], 'ArrowUp');
    expect(document.activeElement).toBe(items[3]);
    key(items[3], 'Home');
    expect(document.activeElement).toBe(items[0]);
  });

  it('closes on Escape and returns focus to the toggle', async () => {
    const { fixture, host, toggle, items } = await setup();
    toggle.focus();
    key(toggle, 'ArrowUp');
    await fixture.whenStable();
    await vi.waitFor(() => expect(document.activeElement).toBe(items[3]));
    key(items[3], 'Escape');
    await fixture.whenStable();
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  it('returns focus to the toggle when an item is chosen from the keyboard', async () => {
    const { fixture, host, toggle, items } = await setup();
    toggle.focus();
    key(toggle, 'ArrowDown');
    await fixture.whenStable();
    await vi.waitFor(() => expect(document.activeElement).toBe(items[0]));
    items[0].click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  it('emits shown once the menu has opened', async () => {
    const { fixture, host, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.shown).toBe(1));
  });

  it('closes only on inside clicks when autoClose is inside', async () => {
    const { fixture, host, toggle, items, outside } = await setup();
    host.autoClose.set('inside');
    toggle.click();
    await fixture.whenStable();
    outside.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    items[0].click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
  });

  it('stays open when a form control inside it is clicked', async () => {
    const { fixture, host, toggle, search } = await setup();
    toggle.click();
    await fixture.whenStable();
    search.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
  });

  it('closes when focus moves outside', async () => {
    const { fixture, host, toggle, items, outside } = await setup();
    toggle.click();
    await fixture.whenStable();
    items[0].focus();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    outside.focus();
    await fixture.whenStable();
    expect(host.open()).toBe(false);
  });

  it('leaves arrow keys to text fields in the menu', async () => {
    const { fixture, toggle, search } = await setup();
    toggle.click();
    await fixture.whenStable();
    search.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    search.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(search);
  });

  it('focuses the first or last item from the menu itself', async () => {
    const { fixture, toggle, menu, items } = await setup();
    toggle.click();
    await fixture.whenStable();
    key(menu, 'ArrowDown');
    expect(document.activeElement).toBe(items[0]);
    menu.focus();
    key(menu, 'ArrowUp');
    expect(document.activeElement).toBe(items[3]);
  });

  it('moves focus when show() is called on an open menu', async () => {
    const { fixture, toggle, items } = await setup();
    const menu = fixture.debugElement.query(By.directive(BsMenu)).injector.get(BsMenu);
    toggle.click();
    await fixture.whenStable();
    menu.show('last');
    expect(document.activeElement).toBe(items[3]);
  });

  it('closes on Escape from the toggle', async () => {
    const { fixture, host, toggle } = await setup();
    toggle.click();
    await fixture.whenStable();
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    toggle.dispatchEvent(event);
    await fixture.whenStable();
    expect(host.open()).toBe(false);
    expect(event.defaultPrevented).toBe(true);

    const again = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    toggle.dispatchEvent(again);
    expect(again.defaultPrevented).toBe(false);
  });

  it('supports a static open attribute and link toggles', async () => {
    const fixture = TestBed.createComponent(LinkToggleHost);
    await fixture.whenStable();
    const toggle: HTMLAnchorElement = fixture.nativeElement.querySelector('.toggle');
    const menu: HTMLElement = fixture.nativeElement.querySelector('.menu');
    expect(menu.id).toBe('custom-menu');
    expect(menu.classList).toContain('show');
    expect(toggle.getAttribute('role')).toBe('button');
    expect(toggle.getAttribute('aria-controls')).toBe('custom-menu');

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    toggle.dispatchEvent(click);
    await fixture.whenStable();
    expect(click.defaultPrevented).toBe(true);
    expect(menu.classList).not.toContain('show');

    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    toggle.dispatchEvent(space);
    await fixture.whenStable();
    expect(space.defaultPrevented).toBe(true);
    expect(menu.classList).toContain('show');
  });
});

@Component({
  imports: [BsMenu, BsMenuToggle, BsSubmenu],
  template: `
    <div style="position: fixed; top: -1000px">
      <button type="button" class="toggle" [bsMenuToggle]="menu">Menu</button>
      <div bsMenu #menu="bsMenu">
        <button type="button" class="menu-item first">New</button>
        <div bsSubmenu class="share">
          <button type="button" class="menu-item share-trigger">Share</button>
          <div class="menu share-menu">
            <button type="button" class="menu-item">Email</button>
            <div bsSubmenu class="more">
              <button type="button" class="menu-item more-trigger">More</button>
              <div class="menu more-menu">
                <button type="button" class="menu-item">Fax</button>
              </div>
            </div>
          </div>
        </div>
        <div bsSubmenu class="export">
          <button type="button" class="menu-item export-trigger">Export</button>
          <div class="menu export-menu">
            <button type="button" class="menu-item">PDF</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
class SubmenuHost {}

describe('BsSubmenu', () => {
  async function setup() {
    const fixture = TestBed.createComponent(SubmenuHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const q = <T extends HTMLElement = HTMLElement>(selector: string) =>
      root.querySelector<T>(selector)!;
    q<HTMLButtonElement>('.toggle').click();
    await fixture.whenStable();
    return { fixture, q };
  }

  const key = (target: HTMLElement, key: string) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

  it('announces its trigger and opens on click without closing the menu', async () => {
    const { fixture, q } = await setup();
    const trigger = q('.share-trigger');
    expect(q('.share').classList).toContain('submenu');
    expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    await fixture.whenStable();
    expect(q('.share-menu').classList).toContain('show');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(q('[bsMenu]').classList).toContain('show');
  });

  it('stays open when a hover is followed by a click or tap', async () => {
    const { fixture, q } = await setup();
    const trigger = q('.share-trigger');
    trigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    trigger.click();
    await fixture.whenStable();
    expect(q('.share-menu').classList).toContain('show');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    trigger.click();
    await fixture.whenStable();
    expect(q('.share-menu').classList).not.toContain('show');
  });

  it('closes the other submenus when one opens', async () => {
    const { fixture, q } = await setup();
    q('.share-trigger').click();
    q('.export-trigger').click();
    await fixture.whenStable();
    expect(q('.share-menu').classList).not.toContain('show');
    expect(q('.export-menu').classList).toContain('show');
  });

  it('opens with the arrow key and returns focus when closed', async () => {
    const { fixture, q } = await setup();
    const trigger = q('.share-trigger');
    trigger.focus();
    key(trigger, 'ArrowRight');
    await fixture.whenStable();
    expect(document.activeElement?.textContent).toBe('Email');
    key(document.activeElement as HTMLElement, 'ArrowDown');
    expect(document.activeElement).toBe(q('.more-trigger'));
    key(document.activeElement as HTMLElement, 'ArrowLeft');
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger);
    expect(q('.share-menu').classList).not.toContain('show');
    expect(q('[bsMenu]').classList).toContain('show');
  });

  it('skips submenu items when moving through the menu', async () => {
    const { q } = await setup();
    const first = q('.first');
    first.focus();
    key(first, 'ArrowDown');
    expect(document.activeElement).toBe(q('.share-trigger'));
    key(document.activeElement as HTMLElement, 'ArrowDown');
    expect(document.activeElement).toBe(q('.export-trigger'));
  });

  it('closes nested submenus with the menu', async () => {
    const { fixture, q } = await setup();
    q('.share-trigger').click();
    q('.more-trigger').click();
    await fixture.whenStable();
    expect(q('.more-menu').classList).toContain('show');
    q<HTMLButtonElement>('.toggle').click();
    await fixture.whenStable();
    expect(q('.share-menu').classList).not.toContain('show');
    expect(q('.more-menu').classList).not.toContain('show');
  });
});
