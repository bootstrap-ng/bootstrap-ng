import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsPlaceholder } from './placeholder';

@Component({
  imports: [BsPlaceholder],
  template: `
    <span bsPlaceholder [width]="6" size="lg"></span>
    <span bsPlaceholder [width]="20"></span>
  `,
})
class Host {}

describe('BsPlaceholder', () => {
  it('sets width and size classes', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [a, b] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('span'));
    expect([...a.classList].sort()).toEqual(['col-6', 'placeholder', 'placeholder-lg']);
    expect([...b.classList].sort()).toEqual(['col-12', 'placeholder']);
  });
});
