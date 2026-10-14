import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsFormControl } from './form-control';
import { BsInputGroup, BsInputGroupSize, BsInputGroupText } from './input-group';

@Component({
  imports: [BsInputGroup, BsInputGroupText, BsFormControl],
  template: `
    <div bsInputGroup [size]="size()">
      <span bsInputGroupText>&#64;</span>
      <input bsFormControl aria-label="Username" />
    </div>
  `,
})
class Host {
  readonly size = signal<BsInputGroupSize>('md');
}

describe('BsInputGroup', () => {
  it('renders the group, text and size classes', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const group: HTMLElement = fixture.nativeElement.querySelector('[bsInputGroup]');
    expect(group.className).toBe('input-group');
    expect(group.querySelector('span')!.className).toBe('input-group-text');
    fixture.componentInstance.size.set('lg');
    await fixture.whenStable();
    expect(group.className).toBe('input-group input-group-lg');
  });
});
