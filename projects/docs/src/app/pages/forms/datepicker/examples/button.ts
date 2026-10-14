import { Component, signal } from '@angular/core';
import { BsButton, BsDatepicker, BsDatepickerDisplay } from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-button-example',
  imports: [BsButton, BsDatepicker, BsDatepickerDisplay],
  templateUrl: './button.html',
})
export class DatepickerButtonExample {
  protected readonly date = signal<string | string[] | null>(null);
  protected readonly period = signal<string | string[] | null>(null);
  protected readonly short: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
}
