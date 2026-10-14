import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsCloseButton } from './close-button';

@Component({
  imports: [BsCloseButton],
  template: `
    <button bsCloseButton></button>
    <button bsCloseButton aria-label="Fermer"></button>
  `,
})
class Host {}

describe('BsCloseButton', () => {
  it('sets class, type and label', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [first, second] = fixture.nativeElement.querySelectorAll('button');
    expect(first.className).toBe('btn-close');
    expect(first.getAttribute('type')).toBe('button');
    expect(first.getAttribute('aria-label')).toBe('Close');
    expect(second.getAttribute('aria-label')).toBe('Fermer');
  });
});
