import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsBreadcrumb, BsBreadcrumbItem, BsBreadcrumbLink } from './breadcrumb';

const ITEMS: BsBreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Data' },
];

@Component({
  imports: [BsBreadcrumb],
  template: `<nav bsBreadcrumb [items]="items()" [divider]="divider()"></nav>`,
})
class Host {
  readonly items = signal(ITEMS);
  readonly divider = signal('');
}

@Component({
  imports: [BsBreadcrumb, BsBreadcrumbLink],
  template: `
    <nav bsBreadcrumb [items]="items" label="Trail">
      <ng-template bsBreadcrumbLink let-item let-current="current">
        <em class="custom" [class.current]="current">{{ item.label }}</em>
      </ng-template>
    </nav>
  `,
})
class CustomHost {
  items = ITEMS;
}

describe('BsBreadcrumb', () => {
  it('renders links, dividers and the current page', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    const items = nav.querySelectorAll('ol.breadcrumb > li.breadcrumb-item');
    expect(items.length).toBe(3);
    expect(nav.querySelectorAll('li.breadcrumb-divider').length).toBe(2);
    for (const divider of Array.from(nav.querySelectorAll('li.breadcrumb-divider'))) {
      expect(divider.getAttribute('aria-hidden')).toBe('true');
    }
    expect(items[0].querySelector('a')!.getAttribute('href')).toBe('/');
    expect(items[2].getAttribute('aria-current')).toBe('page');
    expect(items[2].querySelector('a')).toBeNull();
    expect(items[2].querySelector('.breadcrumb-link.active')!.textContent).toBe('Data');
  });

  it('renders a text divider', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.divider.set('/');
    await fixture.whenStable();
    const divider = fixture.nativeElement.querySelector('.breadcrumb-divider');
    expect(divider.textContent).toBe('/');
  });

  it('uses a custom link template', async () => {
    const fixture = TestBed.createComponent(CustomHost);
    await fixture.whenStable();
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Trail');
    const custom = nav.querySelectorAll('.custom');
    expect(custom.length).toBe(3);
    expect(custom[2].classList).toContain('current');
    expect(custom[0].classList).not.toContain('current');
  });
});
