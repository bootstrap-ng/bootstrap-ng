import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsInvalidFeedback,
  BsOtp,
  BsOtpInput,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-otp-input-field-example',
  imports: [
    ReactiveFormsModule,
    BsOtp,
    BsOtpInput,
    BsFormField,
    BsFormLabel,
    BsFormText,
    BsInvalidFeedback,
  ],
  templateUrl: './field.html',
})
export class OtpInputFieldExample {
  protected readonly code = new FormControl('', [Validators.required, Validators.minLength(6)]);
}
