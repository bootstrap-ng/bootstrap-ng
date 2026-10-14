import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsOtp, BsOtpInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-otp-input-basic-example',
  imports: [ReactiveFormsModule, BsOtp, BsOtpInput],
  templateUrl: './basic.html',
})
export class OtpInputBasicExample {
  protected readonly code = new FormControl('', { nonNullable: true });
  protected readonly completed = signal('');
}
