import { Component, signal } from '@angular/core';
import { BsDatepicker, BsFormControl, BsFormLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-multiple-example',
  imports: [BsDatepicker, BsFormControl, BsFormLabel],
  templateUrl: './multiple.html',
})
export class DatepickerMultipleExample {
  protected readonly dates = signal<string | string[] | null>(['2026-06-10', '2026-06-12']);
}
