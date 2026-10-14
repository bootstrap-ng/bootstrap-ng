import { Component } from '@angular/core';
import { BsFormControl, BsFormLabel, BsStrength, BsStrengthText } from 'bootstrap-ng';

@Component({
  selector: 'docs-password-strength-text-example',
  imports: [BsFormControl, BsFormLabel, BsStrength, BsStrengthText],
  templateUrl: './text.html',
})
export class PasswordStrengthTextExample {}
