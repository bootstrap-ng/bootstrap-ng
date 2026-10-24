import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsBadge, BsBadgeVariant } from './badge';

@Component({
  imports: [BsBadge],
  template: `<span bsBadge theme="primary" [variant]="variant()" [pill]="pill()">New</span>`,
})
class Host {
  readonly variant = signal<BsBadgeVariant>('solid');
  readonly pill = signal(false);
}

describe('BsBadge', () => {
  it('maps inputs to classes', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(el.className).toBe('badge theme-primary');

    fixture.componentInstance.variant.set('outline');
    fixture.componentInstance.pill.set(true);
    await fixture.whenStable();
    expect(el.classList).toContain('badge-outline');
    expect(el.classList).toContain('rounded-pill');
  });
});
