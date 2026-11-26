import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BsDatepicker,
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsInvalidFeedback,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-datepicker-typed-example',
  imports: [
    ReactiveFormsModule,
    BsDatepicker,
    BsFormControl,
    BsFormField,
    BsFormLabel,
    BsFormText,
    BsInvalidFeedback,
  ],
  templateUrl: './typed.html',
})
export class DatepickerTypedExample {
  protected readonly date = new FormControl<string | string[] | null>(null);
  // Shows and reads dates as DD/MM/YYYY in the en-GB locale.
  protected readonly format: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
}
