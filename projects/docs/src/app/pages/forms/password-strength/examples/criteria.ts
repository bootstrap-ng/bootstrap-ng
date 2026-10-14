import { Component } from '@angular/core';
import { passwordScore } from 'bootstrap-ng';
import { BsStrength } from 'bootstrap-ng';

@Component({
  selector: 'docs-password-strength-criteria-example',
  imports: [BsStrength],
  templateUrl: './criteria.html',
})
export class PasswordStrengthCriteriaExample {
  protected readonly samples = [
    'abc',
    'abcdefgh',
    'Abcdefgh1',
    'Abcdefgh1!',
    'Abcdefgh1!@#xyzw',
  ].map((password) => ({ password, score: passwordScore(password) }));
}
