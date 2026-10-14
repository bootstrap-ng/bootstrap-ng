import { Component } from '@angular/core';
import { BsFormControl, BsFormField, BsFormLabel, BsFormText } from 'bootstrap-ng';

@Component({
  selector: 'docs-form-control-basic-example',
  imports: [BsFormControl, BsFormField, BsFormLabel, BsFormText],
  templateUrl: './basic.html',
})
export class FormControlBasicExample {}
