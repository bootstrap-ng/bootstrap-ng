import { Component } from '@angular/core';
import { BsDatepicker, BsFormControl, BsFormLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-min-max-example',
  imports: [BsDatepicker, BsFormControl, BsFormLabel],
  templateUrl: './min-max.html',
})
export class DatepickerMinMaxExample {
  protected readonly weekend = (iso: string) => [0, 6].includes(new Date(`${iso}T00:00`).getDay());
}
