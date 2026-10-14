import { Component } from '@angular/core';
import { BsFormControl, BsFormField, BsFormLabel, BsFormText } from 'bootstrap-ng';

@Component({
  selector: 'docs-field-basic-example',
  imports: [BsFormField, BsFormLabel, BsFormText, BsFormControl],
  templateUrl: './basic.html',
})
export class FieldBasicExample {}
