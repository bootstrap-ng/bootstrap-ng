import { Component } from '@angular/core';
import { BsCheck, BsFormControl, BsInputGroup, BsInputGroupText, BsRadio } from 'bootstrap-ng';

@Component({
  selector: 'docs-input-group-checks-example',
  imports: [BsCheck, BsRadio, BsFormControl, BsInputGroup, BsInputGroupText],
  templateUrl: './checks.html',
})
export class InputGroupChecksExample {}
