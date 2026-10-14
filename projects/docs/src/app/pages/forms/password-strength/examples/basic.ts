import { Component } from '@angular/core';
import { BsFormControl, BsFormLabel, BsStrength } from 'bootstrap-ng';

@Component({
  selector: 'docs-password-strength-basic-example',
  imports: [BsFormControl, BsFormLabel, BsStrength],
  templateUrl: './basic.html',
})
export class PasswordStrengthBasicExample {}
