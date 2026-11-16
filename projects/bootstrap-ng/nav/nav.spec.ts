import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BsNav, BsNavLink } from './nav';
import { BsNavOverflow, provideBsNavOverflowConfig } from './nav-overflow';

@Component({
  imports: [BsNav, BsNavLink],
  template: `
    <ul bsNav [variant]="variant()" [vertical]="vertical()" fill>
      <li class="nav-item"><a bsNavLink active href="#a">A</a></li>
      <li class="nav-item"><a bsNavLink disabled href="#b">B</a></li>
    </ul>
  `,
})
class NavHost {
  readonly variant = signal<'tabs' | 'pills' | null>('pills');
  readonly vertical = signal(false);
}

@Component({
  imports: [BsNavOverflow],
  template: `
    <div bsNavOverflow [style.width.px]="width()" (overflowChange)="count = $event">
      <ul class="nav" style="display: flex; flex-wrap: nowrap" [style.gap.px]="gap()">
        @for (label of labels; track label) {
          <li
            class="nav-item"
            [class.nav-overflow-keep]="label === 'Home'"
            style="width: 100px; flex-shrink: 0">
            <a class="nav-link" href="#" (click)="$event.preventDefault(); clicked = label">{{
              label
            }}</a>
          </li>
        }
      </ul>
    </div>
  `,
})
class OverflowHost {
  labels = ['Home', 'Docs', 'Blog', 'About', 'Help'];
  readonly width = signal(1000);
  readonly gap = signal(0);
  count = 0;
  clicked: string | null = null;
}

describe('BsNav', () => {
  it('sets nav and link classes and states', async () => {
    const fixture = TestBed.createComponent(NavHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const nav = root.querySelector('ul')!;
    expect(nav.className).toBe('nav nav-pills nav-fill');
    fixture.componentInstance.vertical.set(true);
    await fixture.whenStable();
    expect(nav.classList).toContain('nav-pills-vertical');
    const [a, b] = Array.from(root.querySelectorAll<HTMLAnchorElement>('a'));
    expect(a.className).toBe('nav-link active');
    expect(a.getAttribute('aria-current')).toBe('page');
    expect(b.classList).toContain('disabled');
    expect(b.getAttribute('aria-disabled')).toBe('true');
    expect(b.tabIndex).toBe(-1);
  });
});

describe('BsNavOverflow', () => {
  async function setup() {
    const fixture = TestBed.createComponent(OverflowHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const visible = () =>
      Array.from(root.querySelectorAll<HTMLElement>('.nav > .nav-item:not(.nav-overflow-item)'))
        .filter((item) => !item.classList.contains('d-none'))
        .map((item) => item.textContent.trim());
    const more = () => root.querySelector<HTMLElement>('.nav-overflow-item')!;
    return { fixture, host: fixture.componentInstance, root, visible, more };
  }

  it('shows every item and hides "More" when they fit', async () => {
    const { visible, more } = await setup();
    await vi.waitFor(() => expect(more()).toBeTruthy());
    expect(visible()).toEqual(['Home', 'Docs', 'Blog', 'About', 'Help']);
    expect(more().classList).toContain('d-none');
    expect(more().querySelector('button')!.textContent.trim()).toBe('More');
  });

  it('hides "More" when every item fits exactly, counting the gaps between items', async () => {
    const { fixture, host, visible, more } = await setup();
    await vi.waitFor(() => expect(more()).toBeTruthy());
    // Five 100px items and four 10px gaps.
    host.gap.set(10);
    host.width.set(540);
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(host.count).toBe(0);
    expect(visible().length).toBe(5);
    expect(more().classList).toContain('d-none');
  });

  it('moves what does not fit into the menu and keeps kept items', async () => {
    const { fixture, host, visible, more } = await setup();
    host.width.set(320);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.count).toBeGreaterThan(0));
    expect(visible()[0]).toBe('Home');
    expect(more().classList).not.toContain('d-none');
    const copies = Array.from(more().querySelectorAll<HTMLElement>('.menu .menu-item'));
    expect(copies.length).toBe(host.count);
    expect(visible().length + copies.length).toBe(5);
    copies.at(-1)!.click();
    expect(host.clicked).toBe('Help');
  });

  it('positions the menu with the menuStrategy from the config', async () => {
    TestBed.configureTestingModule({
      providers: [provideBsNavOverflowConfig({ menuStrategy: 'fixed' })],
    });
    const { fixture, host, more } = await setup();
    host.width.set(320);
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.count).toBeGreaterThan(0));
    more().querySelector<HTMLButtonElement>('.nav-overflow-toggle')!.click();
    await fixture.whenStable();
    const menu = more().querySelector<HTMLElement>('.menu')!;
    await vi.waitFor(() => expect(menu.style.position).toBe('fixed'));
  });
});

describe('BsNavLink', () => {
  it('stops clicks on a disabled link from navigating or bubbling, and sets a custom aria-current', async () => {
    @Component({
      imports: [BsNav, BsNavLink],
      template: `
        <ul bsNav variant="tabs" vertical>
          <li class="nav-item"><a bsNavLink active current="true" href="#a">A</a></li>
          <li class="nav-item"><a bsNavLink [disabled]="disabled()" href="#b">B</a></li>
        </ul>
      `,
    })
    class LinkHost {
      readonly disabled = signal(true);
    }
    const fixture = TestBed.createComponent(LinkHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    let clicks = 0;
    root.addEventListener('click', () => clicks++);
    // Vertical tabs have no vertical modifier class, so they stack with flex-column.
    expect([...root.querySelector('ul')!.classList].sort()).toEqual([
      'flex-column',
      'nav',
      'nav-tabs',
    ]);
    const [a, b] = Array.from(root.querySelectorAll<HTMLAnchorElement>('a'));
    expect(a.getAttribute('aria-current')).toBe('true');

    const blocked = new MouseEvent('click', { bubbles: true, cancelable: true });
    b.dispatchEvent(blocked);
    expect(blocked.defaultPrevented).toBe(true);
    expect(clicks).toBe(0);

    fixture.componentInstance.disabled.set(false);
    await fixture.whenStable();
    expect(b.hasAttribute('aria-disabled')).toBe(false);
    expect(b.hasAttribute('tabindex')).toBe(false);
    const allowed = new MouseEvent('click', { bubbles: true, cancelable: true });
    b.addEventListener('click', (event) => event.preventDefault(), { once: true });
    b.dispatchEvent(allowed);
    expect(clicks).toBe(1);
  });
});

describe('BsNavOverflow options', () => {
  @Component({
    imports: [BsNavOverflow, BsNavLink],
    template: `
      @if (shown()) {
        <div
          bsNavOverflow
          [style.width.px]="width()"
          [moreText]="moreText()"
          moreLabel="More links"
          [iconPlacement]="iconPlacement()"
          [threshold]="threshold()"
          [collapseBelow]="collapseBelow()">
          <ul class="nav" style="display: flex; flex-wrap: nowrap">
            @for (label of labels(); track label) {
              <li class="nav-item" style="width: 100px; flex-shrink: 0">
                <a
                  bsNavLink
                  [id]="'link-' + label"
                  [active]="label === 'Two'"
                  [disabled]="label === 'Three'"
                  href="#"
                  (click)="$event.preventDefault(); clicked = label"
                  >{{ label }}</a
                >
              </li>
            }
            <li class="nav-item" style="width: 100px; flex-shrink: 0">
              <button class="nav-link" type="button" aria-expanded="false">Menu</button>
              <div class="menu">
                <a class="menu-item" href="#" (click)="$event.preventDefault(); clicked = 'Sub A'"
                  >Sub A</a
                >
                <a class="menu-item" href="#">Sub B</a>
              </div>
            </li>
          </ul>
        </div>
      }
    `,
  })
  class OptionsHost {
    readonly shown = signal(true);
    readonly labels = signal(['One', 'Two', 'Three', 'Four']);
    readonly width = signal(1000);
    readonly moreText = signal('More');
    readonly iconPlacement = signal<'start' | 'end'>('start');
    readonly threshold = signal(0);
    readonly collapseBelow = signal<number | 'md' | null>(null);
    clicked: string | null = null;
  }

  async function setup() {
    const fixture = TestBed.createComponent(OptionsHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const more = () => root.querySelector<HTMLElement>('.nav-overflow-item')!;
    await vi.waitFor(() => expect(more()).toBeTruthy());
    const directive = fixture.debugElement
      .query(By.directive(BsNavOverflow))
      .injector.get(BsNavOverflow);
    const visible = () =>
      Array.from(root.querySelectorAll<HTMLElement>('.nav > .nav-item:not(.nav-overflow-item)'))
        .filter((item) => !item.classList.contains('d-none'))
        .map((item) => item.querySelector('.nav-link')!.textContent.trim());
    const entries = () =>
      Array.from(more().querySelectorAll<HTMLElement>('.nav-overflow-menu > *')).map((entry) => ({
        text: entry.textContent.trim(),
        className: entry.className,
      }));
    /** Applies input changes, then measures again like a resize would. */
    const settle = async () => {
      await fixture.whenStable();
      directive.update();
    };
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      more,
      directive,
      visible,
      entries,
      settle,
    };
  }

  it('labels the toggle and places the icon', async () => {
    const { host, more, settle } = await setup();
    const toggle = () => more().querySelector('button')!;
    expect(toggle().hasAttribute('aria-label')).toBe(false);
    expect(toggle().firstElementChild!.className).toBe('nav-overflow-icon');

    host.iconPlacement.set('end');
    await settle();
    expect(toggle().firstElementChild!.className).toBe('nav-overflow-text');
    expect(toggle().lastElementChild!.className).toBe('nav-overflow-icon');

    host.moreText.set('');
    await settle();
    expect(toggle().querySelector('.nav-overflow-text')).toBeNull();
    expect(toggle().getAttribute('aria-label')).toBe('More links');
  });

  it('copies links with their state and lists an item menu under a header', async () => {
    const { host, directive, entries, visible, settle } = await setup();
    host.collapseBelow.set(2000);
    await settle();
    expect(visible()).toEqual([]);
    expect(directive.overflowCount()).toBe(5);
    expect(entries()).toEqual([
      { text: 'One', className: 'menu-item' },
      { text: 'Two', className: 'menu-item active' },
      { text: 'Three', className: 'menu-item disabled' },
      { text: 'Four', className: 'menu-item' },
      { text: 'Menu', className: 'menu-header' },
      { text: 'Sub A', className: 'menu-item' },
      { text: 'Sub B', className: 'menu-item' },
    ]);
  });

  it('strips ids and ARIA state from copies, and only clicks enabled originals', async () => {
    const { host, more, settle } = await setup();
    host.collapseBelow.set(2000);
    await settle();
    const copies = Array.from(
      more().querySelectorAll<HTMLElement>('.nav-overflow-menu > .menu-item'),
    );
    expect(copies.some((copy) => copy.id)).toBe(false);
    expect(copies.some((copy) => copy.hasAttribute('aria-expanded'))).toBe(false);
    expect(document.querySelectorAll('#link-One')).toHaveLength(1);

    const disabled = new MouseEvent('click', { bubbles: true, cancelable: true });
    copies[2].dispatchEvent(disabled);
    expect(disabled.defaultPrevented).toBe(true);
    expect(host.clicked).toBeNull();

    copies[4].click();
    expect(host.clicked).toBe('Sub A');
    copies[0].click();
    expect(host.clicked).toBe('One');
  });

  it('collapses below a breakpoint from the CSS variables', async () => {
    const { host, visible, settle } = await setup();
    document.documentElement.style.setProperty('--bs-breakpoint-md', '1200px');
    onTestFinished(() => {
      document.documentElement.style.removeProperty('--bs-breakpoint-md');
    });
    host.collapseBelow.set('md');
    await settle();
    expect(visible()).toEqual([]);
    document.documentElement.style.setProperty('--bs-breakpoint-md', '800px');
    await settle();
    expect(visible()).toHaveLength(5);
  });

  it('keeps at least threshold items visible', async () => {
    const { host, directive, visible, settle } = await setup();
    host.width.set(250);
    await settle();
    expect(visible().length).toBeLessThan(3);
    host.threshold.set(3);
    await settle();
    expect(visible()).toEqual(['One', 'Two', 'Three']);
    expect(directive.overflowCount()).toBe(2);
  });

  it('measures again when items are added', async () => {
    const { fixture, host, directive } = await setup();
    host.width.set(550);
    await fixture.whenStable();
    directive.update();
    expect(directive.overflowCount()).toBe(0);
    host.labels.set(['One', 'Two', 'Three', 'Four', 'Five', 'Six']);
    await fixture.whenStable();
    await vi.waitFor(() => expect(directive.overflowCount()).toBeGreaterThan(0));
  });

  it('restores the items and removes "More" when destroyed', async () => {
    const { fixture, host, root, settle } = await setup();
    host.collapseBelow.set(2000);
    await settle();
    expect(root.querySelectorAll('.nav-item.d-none')).toHaveLength(5);
    const items = Array.from(root.querySelectorAll<HTMLElement>('.nav > .nav-item'));
    host.shown.set(false);
    await fixture.whenStable();
    expect(root.querySelector('.nav-overflow-item')).toBeNull();
    expect(items.filter((item) => item.classList.contains('d-none'))).toHaveLength(0);
    expect(items.some((item) => item.dataset['bsNavOverflow'])).toBe(false);
  });

  it('does nothing without a .nav inside', async () => {
    @Component({
      imports: [BsNavOverflow],
      template: `<div bsNavOverflow><p>No nav</p></div>`,
    })
    class EmptyHost {}
    const fixture = TestBed.createComponent(EmptyHost);
    await fixture.whenStable();
    const directive = fixture.debugElement
      .query(By.directive(BsNavOverflow))
      .injector.get(BsNavOverflow);
    directive.update();
    expect(fixture.nativeElement.querySelector('.nav-overflow-item')).toBeNull();
    expect(directive.overflowCount()).toBe(0);
  });
});
