import { Component, signal } from '@angular/core';
import { BsCalendar } from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-inline-example',
  imports: [BsCalendar],
  templateUrl: './inline.html',
})
export class DatepickerInlineExample {
  protected readonly date = signal<string | string[] | null>(null);
  protected readonly range = signal<string | string[] | null>(null);
}
