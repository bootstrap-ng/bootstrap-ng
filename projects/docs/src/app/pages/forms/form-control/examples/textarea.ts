import { Component } from '@angular/core';
import { BsFormControl, BsFormField, BsFormLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-form-control-textarea-example',
  imports: [BsFormControl, BsFormField, BsFormLabel],
  templateUrl: './textarea.html',
})
export class FormControlTextareaExample {}
