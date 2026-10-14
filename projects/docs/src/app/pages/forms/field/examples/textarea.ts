import { Component } from '@angular/core';
import { BsFormControl, BsFormField, BsFormLabel, BsFormText } from 'bootstrap-ng';

@Component({
  selector: 'docs-field-textarea-example',
  imports: [BsFormField, BsFormLabel, BsFormText, BsFormControl],
  templateUrl: './textarea.html',
})
export class FieldTextareaExample {}
