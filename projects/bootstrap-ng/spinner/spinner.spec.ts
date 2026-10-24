import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsSpinner } from './spinner';

@Component({
  imports: [BsSpinner],
  template: `
    <bs-spinner />
    <bs-spinner type="grow" size="sm" label="" />
  `,
})
class Host {}

describe('BsSpinner', () => {
  it('renders an accessible border spinner by default', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [first, second] = fixture.nativeElement.querySelectorAll('bs-spinner');
    expect(first.className).toBe('spinner-border');
    expect(first.getAttribute('role')).toBe('status');
    expect(first.querySelector('.visually-hidden').textContent).toBe('Loading…');

    expect(second.className).toBe('spinner-grow spinner-sm');
    expect(second.getAttribute('role')).toBeNull();
    expect(second.getAttribute('aria-hidden')).toBe('true');
  });
});
