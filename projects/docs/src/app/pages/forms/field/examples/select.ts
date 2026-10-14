import { Component } from '@angular/core';
import { BsFormControl, BsFormField, BsFormLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-field-select-example',
  imports: [BsFormControl, BsFormField, BsFormLabel],
  templateUrl: './select.html',
})
export class FieldSelectExample {}
