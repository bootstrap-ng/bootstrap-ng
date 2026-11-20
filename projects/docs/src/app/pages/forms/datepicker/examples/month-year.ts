import { Component } from '@angular/core';
import { BsDatepicker, BsFormControl, BsFormLabel, toIsoDate } from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-month-year-example',
  imports: [BsDatepicker, BsFormControl, BsFormLabel],
  templateUrl: './month-year.html',
})
export class DatepickerMonthYearExample {
  private readonly now = new Date();
  protected readonly today = toIsoDate(
    this.now.getFullYear(),
    this.now.getMonth(),
    this.now.getDate(),
  );
}
