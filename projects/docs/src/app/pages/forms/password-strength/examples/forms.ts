import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsStrength,
  BsStrengthText,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-password-strength-forms-example',
  imports: [
    ReactiveFormsModule,
    BsFormControl,
    BsFormField,
    BsFormLabel,
    BsFormText,
    BsStrength,
    BsStrengthText,
  ],
  templateUrl: './forms.html',
})
export class PasswordStrengthFormsExample {
  protected readonly password = new FormControl('', { nonNullable: true });
  protected readonly messages = {
    weak: 'Too weak',
    fair: 'Could be better',
    good: 'Good password',
    strong: 'Excellent!',
  };
}
