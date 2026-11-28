import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BsCalendar } from 'bootstrap-ng';

@Component({
  selector: 'docs-calendar-basic-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BsCalendar],
  templateUrl: './basic.html',
})
export class CalendarBasicExample {
  protected readonly date = signal<string | string[] | null>(null);
}
