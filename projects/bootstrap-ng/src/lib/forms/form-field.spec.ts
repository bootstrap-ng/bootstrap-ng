import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsControl } from './control';
import { BsFormControl } from './form-control';
import {
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsInvalidFeedback,
  BsLabel,
  BsValidFeedback,
} from './form-field';

@Component({
  imports: [
    ReactiveFormsModule,
    BsFormField,
    BsFormLabel,
    BsLabel,
    BsFormText,
    BsInvalidFeedback,
    BsValidFeedback,
    BsFormControl,
  ],
  template: `
    <div bsFormField [card]="card()">
      <label bsFormLabel>Email</label>
      <input type="email" bsFormControl [formControl]="email" aria-describedby="extra" />
      @if (help()) {
        <div bsFormText id="help">Help</div>
      }
      <div bsInvalidFeedback>Invalid</div>
      <div bsValidFeedback tooltip>Valid</div>
    </div>
    <div bsFormField>
      <label bsLabel for="custom">Custom</label>
      <input bsFormControl id="custom" />
    </div>
  `,
})
class Host {
  readonly card = signal(false);
  readonly help = signal(true);
  email = new FormControl('', Validators.required);
}

describe('BsFormField', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const field = root.querySelector<HTMLElement>('[bsFormField]')!;
    const input = field.querySelector('input')!;
    return { fixture, root, field, input };
  }

  it('renders the field classes', async () => {
    const { fixture, field } = await setup();
    expect(field.classList).toContain('form-field');
    fixture.componentInstance.card.set(true);
    await fixture.whenStable();
    expect(field.classList).toContain('form-field-card');
  });

  it('points the label to a generated control id', async () => {
    const { field, input } = await setup();
    const label = field.querySelector('label')!;
    expect(label.classList).toContain('form-label');
    expect(input.id).toMatch(/^bs-control-\d+$/);
    expect(label.htmlFor).toBe(input.id);
  });

  it('keeps explicit ids and for attributes', async () => {
    const { root } = await setup();
    const fields = root.querySelectorAll('[bsFormField]');
    expect(fields[1].querySelector('label')!.htmlFor).toBe('custom');
    expect(fields[1].querySelector('input')!.id).toBe('custom');
  });

  it('describes the control with its help text and matching feedback', async () => {
    const { fixture, field, input } = await setup();
    const [invalid, valid] = Array.from(
      field.querySelectorAll<HTMLElement>('[bsInvalidFeedback], [bsValidFeedback]'),
    );
    expect(invalid.classList).toContain('invalid-feedback');
    expect(valid.className).toContain('tooltip valid-tooltip');
    expect(input.getAttribute('aria-describedby')).toBe('extra help');

    fixture.componentInstance.email.markAsTouched();
    await fixture.whenStable();
    expect(input.getAttribute('aria-describedby')).toBe(`extra help ${invalid.id}`);

    fixture.componentInstance.help.set(false);
    await fixture.whenStable();
    expect(input.getAttribute('aria-describedby')).toBe(`extra ${invalid.id}`);
  });
});

describe('BsControl', () => {
  it('can be used on its own for custom controls', async () => {
    @Component({
      imports: [BsControl, BsFormField, BsFormLabel],
      template: `<div bsFormField>
        <label bsFormLabel>Custom</label>
        <input bsControl validation="invalid" />
      </div>`,
    })
    class CustomHost {}
    const fixture = TestBed.createComponent(CustomHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.classList).toContain('is-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
  });
});
