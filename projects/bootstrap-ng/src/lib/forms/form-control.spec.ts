import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

describe('BsFormControl clearable', () => {
  function clearButton(fixture: ComponentFixture<unknown>): HTMLButtonElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('button[bsformcontrolclear]');
  }

  it('shows a clear button while the input has a value', async () => {
    @Component({
      imports: [BsFormControl],
      template: `
        <div style="width: 300px">
          <input
            id="name"
            bsFormControl
            [clearable]="clearable()"
            clearLabel="Clear name"
            (cleared)="clearedCount = clearedCount + 1"
            aria-label="Name" />
        </div>
      `,
    })
    class Host {
      readonly clearable = signal(true);
      clearedCount = 0;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const button = clearButton(fixture)!;
    expect(button.hidden).toBe(true);
    expect(button.type).toBe('button');
    expect(button.className).toBe('btn-close');
    expect(button.getAttribute('aria-label')).toBe('Clear name');
    expect(button.getAttribute('aria-controls')).toBe('name');
    expect(button.previousElementSibling).toBe(input);
    expect(input.style.paddingInlineEnd).not.toBe('');

    input.value = 'Mark';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(button.hidden).toBe(false);
    const box = input.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    expect(rect.right).toBeLessThanOrEqual(box.right);
    expect(rect.left).toBeGreaterThan(box.left + box.width / 2);
    expect(Math.abs(rect.top + rect.height / 2 - (box.top + box.height / 2))).toBeLessThan(1);

    button.click();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
    expect(button.hidden).toBe(true);
    expect(fixture.componentInstance.clearedCount).toBe(1);

    fixture.componentInstance.clearable.set(false);
    await fixture.whenStable();
    expect(clearButton(fixture)).toBeNull();
    expect(input.style.paddingInlineEnd).toBe('');
  });

  it('adds no button unless clearable, and none to selects', async () => {
    @Component({
      imports: [BsFormControl],
      template: `
        <input bsFormControl value="Mark" aria-label="Name" />
        <select bsFormControl clearable aria-label="Size">
          <option>Small</option>
        </select>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(clearButton(fixture)).toBeNull();
    expect(fixture.nativeElement.querySelector('select').style.paddingInlineEnd).toBe('');
  });

  it('hides the button on disabled and readonly controls', async () => {
    @Component({
      imports: [BsFormControl],
      template: `
        <input
          bsFormControl
          clearable
          value="Mark"
          [disabled]="disabled()"
          [readOnly]="readOnly()"
          aria-label="Name" />
      `,
    })
    class Host {
      readonly disabled = signal(true);
      readonly readOnly = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = clearButton(fixture)!;
    expect(button.hidden).toBe(true);
    fixture.componentInstance.disabled.set(false);
    await fixture.whenStable();
    expect(button.hidden).toBe(false);
    fixture.componentInstance.readOnly.set(true);
    await fixture.whenStable();
    expect(button.hidden).toBe(true);
  });

  it('places the button at the start in right-to-left text and on a textarea first line', async () => {
    @Component({
      imports: [BsFormControl],
      template: `
        <div dir="rtl" style="width: 300px">
          <input bsFormControl clearable value="Mark" aria-label="Name" />
        </div>
        <div style="width: 300px">
          <textarea bsFormControl clearable rows="4" aria-label="Notes">Hi</textarea>
        </div>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [rtlButton, textareaButton] = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    const inputBox = input.getBoundingClientRect();
    expect(rtlButton.getBoundingClientRect().left).toBeLessThan(inputBox.left + inputBox.width / 2);
    const textareaBox = textarea.getBoundingClientRect();
    expect(textareaButton.getBoundingClientRect().top).toBeLessThan(
      textareaBox.top + textareaBox.height / 2,
    );
  });

  it('clears a reactive form control', async () => {
    @Component({
      imports: [ReactiveFormsModule, BsFormControl],
      template: `<input bsFormControl clearable [formControl]="name" aria-label="Name" />`,
    })
    class Host {
      readonly name = new FormControl('');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = clearButton(fixture)!;
    expect(button.hidden).toBe(true);
    fixture.componentInstance.name.setValue('Mark');
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(button.hidden).toBe(false);
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.name.value).toBe('');
  });

  it('clears ngModel', async () => {
    @Component({
      imports: [FormsModule, BsFormControl],
      template: `<input bsFormControl clearable [(ngModel)]="name" aria-label="Name" />`,
    })
    class Host {
      name = 'Mark';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = clearButton(fixture)!;
    expect(button.hidden).toBe(false);
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.name).toBe('');
  });

  it('clears Signal Forms', async () => {
    @Component({
      imports: [FormField, BsFormControl],
      template: `<input bsFormControl clearable [formField]="profile.name" aria-label="Name" />`,
    })
    class Host {
      readonly model = signal({ name: 'Mark' });
      profile = form(this.model);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = clearButton(fixture)!;
    expect(button.hidden).toBe(false);
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().name).toBe('');
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
