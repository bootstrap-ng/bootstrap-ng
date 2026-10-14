import { Component } from '@angular/core';
import { BsFormControl, BsFormField, BsFormLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-form-control-file-example',
  imports: [BsFormControl, BsFormField, BsFormLabel],
  templateUrl: './file.html',
})
export class FormControlFileExample {}
