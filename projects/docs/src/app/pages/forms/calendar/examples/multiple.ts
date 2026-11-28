import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { BsCalendar, BsDateValue, selectedDates } from 'bootstrap-ng';

@Component({
  selector: 'docs-calendar-multiple-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BsCalendar],
  templateUrl: './multiple.html',
})
export class CalendarMultipleExample {
  protected readonly days = signal<BsDateValue>(null);
  protected readonly count = computed(() => selectedDates(this.days()).length);
}
