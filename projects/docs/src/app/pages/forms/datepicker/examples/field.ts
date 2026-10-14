import { Component } from '@angular/core';
import { BsDatepicker, BsFormControl, BsFormField, BsFormLabel, BsFormText } from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-field-example',
  imports: [BsDatepicker, BsFormControl, BsFormField, BsFormLabel, BsFormText],
  templateUrl: './field.html',
})
export class DatepickerFieldExample {}
