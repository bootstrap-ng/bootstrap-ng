import { Component, signal } from '@angular/core';
import { BsDatepicker, BsFormControl, BsFormLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-range-example',
  imports: [BsDatepicker, BsFormControl, BsFormLabel],
  templateUrl: './range.html',
})
export class DatepickerRangeExample {
  protected readonly stay = signal<string | string[] | null>(['2026-06-25', '2026-07-08']);
}
