import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsCalendar } from 'bootstrap-ng';

@Component({
  selector: 'docs-calendar-weeks-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BsCalendar],
  templateUrl: './weeks.html',
})
export class CalendarWeeksExample {}
