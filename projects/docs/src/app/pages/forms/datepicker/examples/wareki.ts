import { Component, signal } from '@angular/core';
import {
  BsButton,
  BsDatepicker,
  BsDatepickerDisplay,
  BsFormControl,
  BsFormLabel,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-wareki-example',
  imports: [BsButton, BsDatepicker, BsDatepickerDisplay, BsFormControl, BsFormLabel],
  templateUrl: './wareki.html',
})
export class DatepickerWarekiExample {
  protected readonly date = signal<string | string[] | null>(null);
  // Shows the picked date with its era, such as 令和8年3月31日.
  protected readonly eraDate: Intl.DateTimeFormatOptions = {
    calendar: 'japanese',
    era: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
}
