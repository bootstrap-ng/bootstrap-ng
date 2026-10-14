import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsDatepicker, BsFormControl, BsFormLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-basic-example',
  imports: [ReactiveFormsModule, BsDatepicker, BsFormControl, BsFormLabel],
  templateUrl: './basic.html',
})
export class DatepickerBasicExample {
  protected readonly date = new FormControl<string | null>(null);
}
