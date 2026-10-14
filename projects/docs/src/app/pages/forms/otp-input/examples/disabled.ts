import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsOtp, BsOtpInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-otp-input-disabled-example',
  imports: [ReactiveFormsModule, BsOtp, BsOtpInput],
  templateUrl: './disabled.html',
})
export class OtpInputDisabledExample {
  protected readonly code = new FormControl({ value: '123', disabled: true });
}
