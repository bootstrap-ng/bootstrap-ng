import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsButton, BsButtonSize, BsButtonVariant } from './button';

@Component({
  imports: [BsButton],
  template: `
    <button type="button" bsButton theme="primary">Default</button>
    <button type="button" [bsButton]="variant()" [size]="size()" icon aria-label="Icon">X</button>
  `,
})
class Host {
  readonly variant = signal<BsButtonVariant>('outline');
  readonly size = signal<BsButtonSize>('sm');
}

describe('BsButton', () => {
  it('defaults to a solid button', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [first] = fixture.nativeElement.querySelectorAll('button');
    expect(first.className).toBe('btn-solid theme-primary');
  });

  it('maps variant, size and icon to classes', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const second: HTMLButtonElement = fixture.nativeElement.querySelectorAll('button')[1];
    expect(second.classList).toContain('btn-outline');
    expect(second.classList).toContain('btn-sm');
    expect(second.classList).toContain('btn-icon');

    fixture.componentInstance.variant.set('link');
    fixture.componentInstance.size.set('md');
    await fixture.whenStable();
    expect(second.classList).toContain('btn');
    expect(second.classList).toContain('btn-link');
    expect(second.classList).not.toContain('btn-outline');
    expect(second.classList).not.toContain('btn-sm');
  });
});
