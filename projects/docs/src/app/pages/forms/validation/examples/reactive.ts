import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BsButton,
  BsCheck,
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsInvalidFeedback,
  BsLabel,
  BsRadio,
  BsValidate,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-validation-reactive-example',
  imports: [
    ReactiveFormsModule,
    BsButton,
    BsCheck,
    BsFormControl,
    BsFormField,
    BsFormLabel,
    BsFormText,
    BsInvalidFeedback,
    BsLabel,
    BsRadio,
    BsValidate,
  ],
  templateUrl: './reactive.html',
})
export class ValidationReactiveExample {
  protected readonly form = new FormGroup({
    name: new FormControl('Mark Otto', Validators.required),
    city: new FormControl('', Validators.required),
    zip: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    shipping: new FormControl<string | null>(null, Validators.required),
    terms: new FormControl(false, Validators.requiredTrue),
  });
  protected readonly message = signal('');

  protected save(): void {
    this.message.set(this.form.valid ? 'Form submitted.' : 'Please fix the errors above.');
  }
}
