import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BsButton,
  BsCheck,
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsInvalidFeedback,
  BsLabel,
  BsValidFeedback,
  BsValidate,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-field-validation-example',
  imports: [
    ReactiveFormsModule,
    BsButton,
    BsCheck,
    BsFormControl,
    BsFormField,
    BsFormLabel,
    BsInvalidFeedback,
    BsLabel,
    BsValidate,
    BsValidFeedback,
  ],
  templateUrl: './validation.html',
})
export class FieldValidationExample {
  protected readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    terms: new FormControl(false, Validators.requiredTrue),
  });
}
