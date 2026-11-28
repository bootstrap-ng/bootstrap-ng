import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsCalendar, parseIsoDate } from 'bootstrap-ng';

@Component({
  selector: 'docs-calendar-forms-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, BsCalendar],
  templateUrl: './forms.html',
})
export class CalendarFormsExample {
  protected readonly delivery = new FormControl<string | null>(null, Validators.required);

  /** Deliveries only happen on weekdays. */
  protected readonly weekend = (iso: string): boolean => {
    const day = parseIsoDate(iso)?.getDay();
    return day === 0 || day === 6;
  };
}
