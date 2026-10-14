import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsInvalidFeedback,
  BsValidFeedback,
  BsValidate,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-validation-valid-example',
  imports: [
    ReactiveFormsModule,
    BsFormControl,
    BsFormField,
    BsFormLabel,
    BsInvalidFeedback,
    BsValidate,
    BsValidFeedback,
  ],
  templateUrl: './valid.html',
})
export class ValidationValidExample {
  protected readonly email = new FormControl('', [Validators.required, Validators.email]);
}
