import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BsFormControl,
  BsFormField,
  BsFormFloating,
  BsInvalidFeedback,
  BsLabel,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-floating-labels-validation-example',
  imports: [
    ReactiveFormsModule,
    BsFormControl,
    BsFormFloating,
    BsLabel,
    BsFormField,
    BsInvalidFeedback,
  ],
  templateUrl: './validation.html',
})
export class FloatingLabelsValidationExample {
  protected readonly email = new FormControl('not-an-email', Validators.email);

  constructor() {
    this.email.markAsTouched();
  }
}
