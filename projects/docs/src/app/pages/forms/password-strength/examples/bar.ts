import { Component } from '@angular/core';
import { BsFormControl, BsFormLabel, BsStrength } from 'bootstrap-ng';

@Component({
  selector: 'docs-password-strength-bar-example',
  imports: [BsFormControl, BsFormLabel, BsStrength],
  templateUrl: './bar.html',
})
export class PasswordStrengthBarExample {}
