import { Component } from '@angular/core';
import { BsDatepicker, BsFormControl, BsFormLabel, parseIsoDate } from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-min-max-example',
  imports: [BsDatepicker, BsFormControl, BsFormLabel],
  templateUrl: './min-max.html',
})
export class DatepickerMinMaxExample {
  protected readonly weekend = (iso: string) => {
    const day = parseIsoDate(iso)?.getDay();
    return day === 0 || day === 6;
  };
}
