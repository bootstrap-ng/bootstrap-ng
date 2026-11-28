import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BsCalendar, BsDateValue, parseIsoDate, selectedDates } from 'bootstrap-ng';

const DAY = 24 * 60 * 60 * 1000;

@Component({
  selector: 'docs-calendar-range-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BsCalendar],
  templateUrl: './range.html',
})
export class CalendarRangeExample {
  protected readonly stay = signal<BsDateValue>(null);
  protected readonly nights = signal(0);

  /** Runs on selectionComplete, once both dates of the range are picked. */
  protected countNights(value: BsDateValue): number {
    const [start, end] = selectedDates(value).map((iso) => parseIsoDate(iso)?.getTime() ?? 0);
    return start && end ? Math.round((end - start) / DAY) : 0;
  }
}
