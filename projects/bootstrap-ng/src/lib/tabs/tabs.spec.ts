import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsTab, BsTabContent, BsTabPane, BsTabs } from './tabs';

@Component({
  imports: [BsTabs, BsTab, BsTabContent, BsTabPane],
  template: `
    <nav bsTabs #tabs="bsTabs" class="nav-tabs" [(active)]="active" aria-label="Sections">
      <button bsTab="home">Home</button>
      <button bsTab="profile">Profile</button>
      <button bsTab="disabled" disabled>Disabled</button>
      <button bsTab="contact">Contact</button>
    </nav>
    <div [bsTabContent]="tabs">
      <div bsTabPane="home">Home pane</div>
      <div bsTabPane="profile">Profile pane</div>
      <div bsTabPane="disabled">Disabled pane</div>
      <div bsTabPane="contact">Contact pane</div>
    </div>
  `,
})
class Host {
  readonly active = signal<string | undefined>(undefined);
}

@Component({
  imports: [BsTabs, BsTab],
  template: `
    <div [attr.dir]="dir()">
      <nav bsTabs vertical class="nav-pills" [(active)]="active" aria-label="Links">
        <a href="#one" bsTab="one">One</a>
        <a href="#two" bsTab="two">Two</a>
        <a href="#three" bsTab="three" class="disabled" aria-disabled="true">Three</a>
      </nav>
    </div>
  `,
})
class LinkHost {
  readonly active = signal<string | undefined>(undefined);
  readonly dir = signal<'ltr' | 'rtl'>('ltr');
}

@Component({
  imports: [BsTabs, BsTab],
  template: `
    <nav bsTabs class="nav-tabs" [(active)]="active" aria-label="Dynamic">
      <button bsTab="one" [disabled]="locked()">One</button>
      <button bsTab="two">Two</button>
      <a href="#three" bsTab="three" [disabled]="linkLocked()">Three</a>
    </nav>
  `,
})
class DynamicHost {
  readonly active = signal<string | undefined>(undefined);
  readonly locked = signal(false);
  readonly linkLocked = signal(false);
}

describe('BsTabs', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panes = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    return { fixture, host: fixture.componentInstance, root, tabs, panes };
  }

  function key(target: HTMLElement, key: string) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  it('renders Bootstrap markup and links tabs to panes', async () => {
    const { root, tabs, panes } = await setup();
    const list = root.querySelector('nav')!;
    expect(list.classList).toContain('nav');
    expect(list.getAttribute('role')).toBe('tablist');
    expect(tabs[0].classList).toContain('nav-link');
    expect(tabs[0].type).toBe('button');
    expect(panes[0].parentElement!.classList).toContain('tab-content');
    expect(panes[0].classList).toContain('tab-pane');
    expect(tabs[0].getAttribute('aria-controls')).toBe(panes[0].id);
    expect(panes[0].getAttribute('aria-labelledby')).toBe(tabs[0].id);
    expect(panes[0].tabIndex).toBe(0);
  });

  it('activates the first tab by default', async () => {
    const { tabs, panes } = await setup();
    expect(tabs[0].classList).toContain('active');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('tabindex')).toBeNull();
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].getAttribute('tabindex')).toBe('-1');
    expect(panes[0].classList).toContain('active');
    expect(panes[1].classList).not.toContain('active');
  });

  it('shows a tab on click and updates the model', async () => {
    const { fixture, host, tabs, panes } = await setup();
    tabs[1].click();
    await fixture.whenStable();
    expect(host.active()).toBe('profile');
    expect(tabs[1].classList).toContain('active');
    expect(panes[1].classList).toContain('active');
    expect(panes[0].classList).not.toContain('active');
  });

  it('follows the model', async () => {
    const { fixture, host, tabs } = await setup();
    host.active.set('contact');
    await fixture.whenStable();
    expect(tabs[3].classList).toContain('active');
  });

  it('falls back to the first enabled tab when the active key has no enabled tab', async () => {
    const { fixture, host, tabs, panes } = await setup();
    for (const key of ['missing', 'disabled']) {
      host.active.set(key);
      await fixture.whenStable();
      expect(tabs[0].classList).toContain('active');
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
      expect(tabs[0].getAttribute('tabindex')).toBeNull();
      expect(tabs[2].classList).not.toContain('active');
      expect(panes[0].classList).toContain('active');
    }
  });

  it('moves between enabled tabs with arrow keys, Home and End', async () => {
    const { fixture, host, tabs } = await setup();
    tabs[0].focus();
    key(tabs[0], 'ArrowRight');
    await fixture.whenStable();
    expect(host.active()).toBe('profile');
    expect(document.activeElement).toBe(tabs[1]);

    key(tabs[1], 'ArrowRight');
    await fixture.whenStable();
    expect(host.active()).toBe('contact');

    key(tabs[3], 'ArrowRight');
    await fixture.whenStable();
    expect(host.active()).toBe('home');

    key(tabs[0], 'ArrowLeft');
    await fixture.whenStable();
    expect(host.active()).toBe('contact');

    key(tabs[3], 'Home');
    await fixture.whenStable();
    expect(host.active()).toBe('home');

    key(tabs[0], 'End');
    await fixture.whenStable();
    expect(host.active()).toBe('contact');
  });

  it('ignores arrow keys with modifiers', async () => {
    const { fixture, host, tabs } = await setup();
    tabs[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }),
    );
    await fixture.whenStable();
    expect(host.active()).toBeUndefined();
  });

  describe('with links', () => {
    async function setupLinks(init?: (host: LinkHost) => void) {
      const fixture = TestBed.createComponent(LinkHost);
      init?.(fixture.componentInstance);
      await fixture.whenStable();
      const root: HTMLElement = fixture.nativeElement;
      const tabs = Array.from(root.querySelectorAll<HTMLAnchorElement>('[role="tab"]'));
      return { fixture, host: fixture.componentInstance, root, tabs };
    }

    it('marks the list as vertical and uses ArrowDown and ArrowUp', async () => {
      const { fixture, host, root, tabs } = await setupLinks();
      expect(root.querySelector('nav')!.getAttribute('aria-orientation')).toBe('vertical');
      expect(tabs[0].hasAttribute('type')).toBe(false);
      key(tabs[0], 'ArrowDown');
      await fixture.whenStable();
      expect(host.active()).toBe('two');
      key(tabs[1], 'ArrowDown');
      await fixture.whenStable();
      expect(host.active()).toBe('one');
      key(tabs[0], 'ArrowUp');
      await fixture.whenStable();
      expect(host.active()).toBe('two');
    });

    it('prevents navigation and skips disabled links', async () => {
      const { fixture, host, tabs } = await setupLinks();
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      tabs[1].dispatchEvent(click);
      await fixture.whenStable();
      expect(click.defaultPrevented).toBe(true);
      expect(host.active()).toBe('two');

      tabs[2].click();
      await fixture.whenStable();
      expect(host.active()).toBe('two');
    });

    it('reverses the left and right arrow keys in right-to-left layouts', async () => {
      const { fixture, host, tabs } = await setupLinks((h) => h.dir.set('rtl'));
      key(tabs[0], 'ArrowLeft');
      await fixture.whenStable();
      expect(host.active()).toBe('two');
      key(tabs[1], 'ArrowRight');
      await fixture.whenStable();
      expect(host.active()).toBe('one');
    });
  });

  describe('with bound disabled state', () => {
    it('falls back to an enabled tab when the active tab becomes disabled', async () => {
      const fixture = TestBed.createComponent(DynamicHost);
      await fixture.whenStable();
      const host = fixture.componentInstance;
      const tabs = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]'),
      );
      expect(tabs[0].classList).toContain('active');

      host.locked.set(true);
      await fixture.whenStable();
      expect(tabs[0].hasAttribute('disabled')).toBe(true);
      expect(tabs[0].classList).not.toContain('active');
      expect(tabs[1].classList).toContain('active');
      expect(tabs[1].getAttribute('tabindex')).toBeNull();

      host.locked.set(false);
      await fixture.whenStable();
      expect(tabs[0].hasAttribute('disabled')).toBe(false);
      expect(tabs[0].classList).toContain('active');
    });

    it('marks disabled links with aria-disabled and the disabled class', async () => {
      const fixture = TestBed.createComponent(DynamicHost);
      const host = fixture.componentInstance;
      host.active.set('three');
      await fixture.whenStable();
      const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('a')!;
      expect(link.classList).toContain('active');

      host.linkLocked.set(true);
      await fixture.whenStable();
      expect(link.classList).toContain('disabled');
      expect(link.getAttribute('aria-disabled')).toBe('true');
      expect(link.hasAttribute('disabled')).toBe(false);
      expect(link.classList).not.toContain('active');

      link.click();
      await fixture.whenStable();
      expect(host.active()).toBe('three');
      expect(link.classList).not.toContain('active');
    });
  });
});
