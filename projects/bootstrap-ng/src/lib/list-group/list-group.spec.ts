import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsListGroup, BsListGroupItem } from './list-group';

@Component({
  imports: [BsListGroup, BsListGroupItem],
  template: `
    <div bsListGroup flush [horizontal]="horizontal()">
      <a bsListGroupItem href="#" active>Active</a>
      <a bsListGroupItem href="#" disabled>Disabled link</a>
      <button type="button" bsListGroupItem disabled>Disabled button</button>
      <div bsListGroupItem theme="success">Plain</div>
    </div>
  `,
})
class Host {
  readonly horizontal = signal<boolean | 'md'>(false);
}

describe('BsListGroup', () => {
  it('sets list and item classes and states', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const list = root.querySelector('[bsListGroup]')!;
    expect(list.className).toBe('list-group list-group-flush');
    fixture.componentInstance.horizontal.set('md');
    await fixture.whenStable();
    expect(list.classList).toContain('md:list-group-horizontal');

    const [active, link, button, plain] = Array.from(
      root.querySelectorAll<HTMLElement>('[bsListGroupItem]'),
    );
    expect(active.className).toBe('list-group-item list-group-item-action active');
    expect(active.getAttribute('aria-current')).toBe('true');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.tabIndex).toBe(-1);
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(plain.className).toBe('list-group-item theme-success');
  });
});
