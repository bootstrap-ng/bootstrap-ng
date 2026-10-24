import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsNav, BsNavLink } from './nav';
import { BsNavOverflow } from './nav-overflow';

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
});
