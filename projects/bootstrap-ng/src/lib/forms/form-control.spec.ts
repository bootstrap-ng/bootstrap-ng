import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { BsValidation } from './control';
import { BsFormControl, BsFormControlSize, BsFormControlVariant } from './form-control';
import { BsValidate } from './validate';

describe('BsFormControl', () => {
  it('renders variant, size, caret and color classes', async () => {
    @Component({
      imports: [BsFormControl],
      template: `
        <input
          class="extra"
          [bsFormControl]="variant()"
          [controlSize]="size()"
          [caret]="caret()"
          aria-label="Text" />
        <input type="color" bsFormControl aria-label="Color" />
      `,
    })
    class Host {
      readonly variant = signal<BsFormControlVariant | ''>('');
      readonly size = signal<BsFormControlSize>('md');
      readonly caret = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [input, color] = fixture.nativeElement.querySelectorAll('input');
    expect(input.className).toBe('extra form-control');
    expect(color.classList).toContain('form-control-color');

    fixture.componentInstance.size.set('lg');
    fixture.componentInstance.caret.set(true);
    await fixture.whenStable();
    expect(input.classList).toContain('form-control-lg');
    expect(input.classList).toContain('form-control-caret');

    fixture.componentInstance.variant.set('plaintext');
    await fixture.whenStable();
    expect(input.classList).toContain('form-control-plaintext');
    expect(input.classList).not.toContain('form-control');

    fixture.componentInstance.variant.set('ghost');
    await fixture.whenStable();
    expect(input.classList).toContain('form-ghost');
  });

  it('forces a validation state', async () => {
    @Component({
      imports: [BsFormControl],
      template: `<input bsFormControl [validation]="validation()" aria-label="Name" />`,
    })
    class Host {
      readonly validation = signal<BsValidation>('valid');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.classList).toContain('is-valid');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    fixture.componentInstance.validation.set('invalid');
    await fixture.whenStable();
    expect(input.classList).toContain('is-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  describe('with Reactive Forms', () => {
    @Component({
      imports: [ReactiveFormsModule, BsFormControl, BsValidate],
      template: `
        <form [bsValidate]="mode()" [formGroup]="form">
          <input bsFormControl formControlName="name" aria-label="Name" />
          <button type="submit">Submit</button>
        </form>
      `,
    })
    class Host {
      readonly mode = signal<'' | 'valid'>('');
      form = new FormGroup({ name: new FormControl('', Validators.required) });
    }

    async function setup() {
      const fixture = TestBed.createComponent(Host);
      await fixture.whenStable();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      return { fixture, input, host: fixture.componentInstance };
    }

    it('shows errors once the control is touched', async () => {
      const { fixture, input, host } = await setup();
      expect(input.classList).not.toContain('is-invalid');
      input.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(input.classList).toContain('is-invalid');

      host.form.controls.name.setValue('Mark');
      await fixture.whenStable();
      expect(input.classList).not.toContain('is-invalid');
      expect(input.classList).not.toContain('is-valid');
    });

    it('shows errors after the form is submitted', async () => {
      const { fixture, input } = await setup();
      fixture.nativeElement.querySelector('button').click();
      await fixture.whenStable();
      expect(input.classList).toContain('is-invalid');
    });

    it('shows success styles in a bsValidate="valid" form', async () => {
      const { fixture, input, host } = await setup();
      host.mode.set('valid');
      host.form.controls.name.setValue('Mark');
      host.form.markAllAsTouched();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('form').dataset.bsValidate).toBe('valid');
      expect(input.classList).toContain('is-valid');
    });
  });

  it('follows ngModel', async () => {
    @Component({
      imports: [FormsModule, BsFormControl],
      template: `<input bsFormControl required [(ngModel)]="name" aria-label="Name" />`,
    })
    class Host {
      name = '';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(input.classList).toContain('is-invalid');
  });

  it('follows Signal Forms', async () => {
    @Component({
      imports: [FormField, BsFormControl],
      template: `<input bsFormControl [formField]="profile.name" aria-label="Name" />`,
    })
    class Host {
      readonly model = signal({ name: '' });
      profile = form(this.model, (path) => required(path.name));
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.classList).not.toContain('is-invalid');
    fixture.componentInstance.profile.name().markAsTouched();
    await fixture.whenStable();
    expect(input.classList).toContain('is-invalid');
    input.value = 'Mark';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(input.classList).not.toContain('is-invalid');
  });
});

describe('BsValidate', () => {
  @Component({
    imports: [BsFormControl, BsValidate],
    template: `
      <form bsValidate (submit)="submits = submits + 1">
        <input bsFormControl required aria-label="Name" />
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>
    `,
  })
  class Host {
    submits = 0;
  }

  it('sets the validation attributes', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    expect(form.getAttribute('data-bs-validate')).toBe('');
    expect(form.noValidate).toBe(true);
  });

  it('blocks invalid submissions and shows native validity', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    const input: HTMLInputElement = form.querySelector('input')!;
    const event = new SubmitEvent('submit', { cancelable: true });
    form.dispatchEvent(event);
    await fixture.whenStable();
    expect(event.defaultPrevented).toBe(true);
    expect(input.classList).toContain('is-invalid');
    expect(document.activeElement).toBe(input);

    input.value = 'Mark';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(input.classList).not.toContain('is-invalid');

    form.dispatchEvent(new Event('reset'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(input.classList).not.toContain('is-invalid');
  });
});
