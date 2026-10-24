import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsFormAdorn, BsFormAdornIcon, BsFormAdornText } from './form-adorn';
import { BsFormControl, BsFormControlSize } from './form-control';

@Component({
  imports: [BsFormAdorn, BsFormAdornIcon, BsFormAdornText, BsFormControl],
  template: `
    <label bsFormAdorn [end]="end()" [size]="size()">
      <span bsFormAdornIcon>*</span>
      <span bsFormAdornText>$</span>
      <input bsFormControl="ghost" placeholder="0.00" />
    </label>
  `,
})
class Host {
  readonly end = signal(false);
  readonly size = signal<BsFormControlSize>('md');
}

describe('BsFormAdorn', () => {
  it('renders the wrapper and hides adornments from screen readers', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const label: HTMLElement = fixture.nativeElement.querySelector('label');
    expect(Array.from(label.classList).sort()).toEqual(['form-adorn', 'form-control']);
    const [icon, text] = Array.from(label.querySelectorAll('span'));
    expect(icon.className).toBe('form-adorn-icon');
    expect(text.className).toBe('form-adorn-text');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(text.getAttribute('aria-hidden')).toBe('true');
    expect(label.querySelector('input')!.classList).toContain('form-ghost');

    fixture.componentInstance.end.set(true);
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(Array.from(label.classList).sort()).toEqual([
      'form-adorn',
      'form-adorn-end',
      'form-control',
      'form-control-sm',
    ]);
  });
});
