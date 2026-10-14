import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsPagination } from './pagination';

@Component({
  imports: [BsPagination],
  template: `
    <nav
      bsPagination
      aria-label="Pages"
      [(page)]="page"
      [pageCount]="count()"
      [size]="size()"
      theme="accent"></nav>
  `,
})
class Host {
  readonly page = signal(1);
  readonly count = signal(5);
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
}

describe('BsPagination', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    const labels = () =>
      Array.from(nav.querySelectorAll('.page-link')).map((el) => el.textContent.trim());
    return { fixture, host: fixture.componentInstance, nav, labels };
  }

  it('renders every page when they fit', async () => {
    const { nav, labels } = await setup();
    expect(nav.querySelector('ul')!.className).toBe('pagination theme-accent');
    expect(labels()).toEqual(['Previous', '1', '2', '3', '4', '5', 'Next']);
    expect(nav.querySelector('[aria-current="page"]')!.textContent.trim()).toBe('1');
  });

  it('disables previous on the first page and next on the last', async () => {
    const { fixture, host, nav } = await setup();
    const buttons = () => nav.querySelectorAll<HTMLButtonElement>('button');
    expect(buttons()[0].disabled).toBe(true);
    host.page.set(5);
    await fixture.whenStable();
    expect(buttons()[0].disabled).toBe(false);
    expect(buttons()[buttons().length - 1].disabled).toBe(true);
  });

  it('changes page on click', async () => {
    const { fixture, host, nav } = await setup();
    const buttons = nav.querySelectorAll<HTMLButtonElement>('button');
    buttons[3].click();
    await fixture.whenStable();
    expect(host.page()).toBe(3);
    buttons[buttons.length - 1].click();
    await fixture.whenStable();
    expect(host.page()).toBe(4);
    expect(nav.querySelector('.page-item.active')!.textContent.trim()).toBe('4');
  });

  it('moves focus to the current page when previous or next becomes disabled', async () => {
    const { fixture, host, nav } = await setup();
    host.page.set(4);
    await fixture.whenStable();
    const next = nav.querySelector<HTMLButtonElement>('li:last-child button')!;
    next.focus();
    next.click();
    await fixture.whenStable();
    expect(host.page()).toBe(5);
    expect(next.disabled).toBe(true);
    expect(document.activeElement).toBe(nav.querySelector('[aria-current="page"]'));

    host.page.set(2);
    await fixture.whenStable();
    const previous = nav.querySelector<HTMLButtonElement>('li:first-child button')!;
    previous.focus();
    previous.click();
    await fixture.whenStable();
    expect(host.page()).toBe(1);
    expect(previous.disabled).toBe(true);
    expect(document.activeElement).toBe(nav.querySelector('[aria-current="page"]'));
  });

  it('keeps the last page current when pageCount shrinks below page', async () => {
    const { fixture, host, nav } = await setup();
    host.count.set(10);
    host.page.set(8);
    await fixture.whenStable();
    host.count.set(5);
    await fixture.whenStable();
    expect(nav.querySelector('[aria-current="page"]')!.textContent.trim()).toBe('5');
    expect(nav.querySelector('.page-item.active')!.textContent.trim()).toBe('5');
    const buttons = nav.querySelectorAll<HTMLButtonElement>('button');
    expect(buttons[buttons.length - 1].disabled).toBe(true);
    buttons[0].click();
    await fixture.whenStable();
    expect(host.page()).toBe(4);
  });

  it('floors a fractional pageCount', async () => {
    const { fixture, host, nav } = await setup();
    host.count.set(5.5);
    host.page.set(5);
    await fixture.whenStable();
    const buttons = nav.querySelectorAll<HTMLButtonElement>('button');
    const next = buttons[buttons.length - 1];
    expect(next.disabled).toBe(true);
    next.disabled = false;
    next.click();
    await fixture.whenStable();
    expect(host.page()).toBe(5);
  });

  it('adds ellipses for many pages', async () => {
    const { fixture, host, labels } = await setup();
    host.count.set(20);
    await fixture.whenStable();
    expect(labels()).toEqual(['Previous', '1', '2', '3', '4', '5', '…', '20', 'Next']);
    host.page.set(10);
    await fixture.whenStable();
    expect(labels()).toEqual(['Previous', '1', '…', '9', '10', '11', '…', '20', 'Next']);
    host.page.set(20);
    await fixture.whenStable();
    expect(labels()).toEqual(['Previous', '1', '…', '16', '17', '18', '19', '20', 'Next']);
  });

  it('sets the size class', async () => {
    const { fixture, host, nav } = await setup();
    host.size.set('sm');
    await fixture.whenStable();
    expect(nav.querySelector('ul')!.classList).toContain('pagination-sm');
  });
});
