import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsValidation } from './control';
import { BsFormFloating } from './floating';
import { BsFormControl } from './form-control';
import { BsFormField, BsInvalidFeedback, BsLabel } from './form-field';

@Component({
  imports: [BsFormFloating, BsFormControl, BsFormField, BsInvalidFeedback, BsLabel],
  template: `
    <div bsFormField>
      <div bsFormFloating>
        <label bsLabel>Email</label>
        <input bsFormControl placeholder="Email" [validation]="validation()" />
      </div>
      <div bsInvalidFeedback>Invalid</div>
    </div>
  `,
})
class Host {
  readonly validation = signal<BsValidation>('auto');
}

@Component({
  imports: [BsFormFloating],
  template: `<div bsFormFloating always></div>`,
})
class AlwaysHost {}

describe('BsFormFloating', () => {
  it('wires the label and mirrors the control state', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const floating: HTMLElement = fixture.nativeElement.querySelector('[bsFormFloating]');
    const input = floating.querySelector('input')!;
    const feedback: HTMLElement = fixture.nativeElement.querySelector('[bsInvalidFeedback]');
    expect(floating.classList).toContain('form-floating');
    expect(floating.querySelector('label')!.htmlFor).toBe(input.id);

    fixture.componentInstance.validation.set('invalid');
    await fixture.whenStable();
    expect(floating.classList).toContain('is-invalid');
    expect(input.getAttribute('aria-describedby')).toBe(feedback.id);
  });

  it('keeps the label floated with always', async () => {
    const fixture = TestBed.createComponent(AlwaysHost);
    await fixture.whenStable();
    const floating: HTMLElement = fixture.nativeElement.querySelector('[bsFormFloating]');
    expect(floating.classList).toContain('form-floating-always');
  });
});
