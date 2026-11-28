import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { CalendarBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { CalendarFormsExample } from './examples/forms';
import formsHtml from './examples/forms.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import formsTs from './examples/forms.ts' with { loader: 'text' };
import { CalendarRangeExample } from './examples/range';
import rangeHtml from './examples/range.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import rangeTs from './examples/range.ts' with { loader: 'text' };
import { CalendarMultipleExample } from './examples/multiple';
import multipleHtml from './examples/multiple.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import multipleTs from './examples/multiple.ts' with { loader: 'text' };
import { CalendarWeeksExample } from './examples/weeks';
import weeksHtml from './examples/weeks.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Calendar',
  lead: 'An always-visible calendar for picking a date, several dates or a range.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/datepicker/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Add <code>bsCalendar</code> to a <code>div</code> for a calendar that is always visible, such as on a booking page or in a sidebar. It is the calendar the <a href="forms/datepicker">datepicker</a> opens, with the same options. Bind the picked date with <code>[(value)]</code>: an ISO date (<code>YYYY-MM-DD</code>), or <code>null</code>.',
      example: CalendarBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'forms',
      title: 'Forms and disabled dates',
      description:
        'Bind it with <code>[formControl]</code>, <code>[(ngModel)]</code> or <code>[formField]</code> like any form control. Restrict the dates with <code>min</code> and <code>max</code>, or with a <code>dateDisabled</code> function, such as one that disables weekends. The <a href="#api-date-helpers">date helpers</a> turn ISO dates into <code>Date</code> objects.',
      example: CalendarFormsExample,
      html: formsHtml,
      ts: formsTs,
    },
    {
      id: 'range',
      title: 'Date range',
      description:
        'Set <code>selectionMode="range"</code> to pick a start and an end date, and <code>monthsCount</code> to show months side by side. The value is an array of the two dates. <code>selectionComplete</code> emits once both are picked.',
      example: CalendarRangeExample,
      html: rangeHtml,
      ts: rangeTs,
    },
    {
      id: 'multiple',
      title: 'Multiple dates',
      description:
        'Set <code>selectionMode="multiple"</code> to pick several dates. The value is an array, and picking a date again removes it. <code>selectedDates()</code> returns the dates of any value as an array.',
      example: CalendarMultipleExample,
      html: multipleHtml,
      ts: multipleTs,
    },
    {
      id: 'weeks',
      title: 'Weeks',
      description:
        'Add <code>weekNumbers</code> to show a week number before each week: ISO weeks by default, or set <code>weekNumbering="simple"</code> to count from 1 January. <code>firstWeekday</code> sets the first day of the week (0 for Sunday), and <code>hideOutsideDays</code> hides the days of the neighboring months. Set them for every calendar and datepicker with <a href="getting-started/configuration"><code>provideBsCalendarConfig()</code></a>.',
      example: CalendarWeeksExample,
      html: weeksHtml,
    },
  ],
  api: [
    {
      name: 'BsCalendar',
      selector: '[bsCalendar]',
      exportAs: 'bsCalendar',
      inputs: [
        {
          name: 'value',
          type: 'BsDateValue',
          default: 'null',
          description: 'ISO date, or an array of them with multiple and range. Supports [(value)].',
        },
        {
          name: 'selectionMode',
          type: "'single' | 'multiple' | 'range'",
          default: "'single'",
          description: 'How dates are selected.',
        },
        {
          name: 'min',
          type: 'string | null',
          default: 'null',
          description: 'Earliest selectable date, as YYYY-MM-DD.',
        },
        {
          name: 'max',
          type: 'string | null',
          default: 'null',
          description: 'Latest selectable date, as YYYY-MM-DD.',
        },
        {
          name: 'dateDisabled',
          type: '((iso: string) => boolean) | null',
          default: 'null',
          description: 'Returns true for dates that can’t be selected.',
        },
        {
          name: 'firstWeekday',
          type: 'number',
          default: '1',
          description: 'First day of the week: 0 for Sunday, 1 for Monday.',
        },
        {
          name: 'monthsCount',
          type: 'number',
          default: '1',
          description: 'Number of months shown side by side.',
        },
        {
          name: 'weekNumbers',
          type: 'boolean',
          default: 'false',
          description: 'Shows the week numbers before each week.',
        },
        {
          name: 'weekNumbering',
          type: "'iso' | 'simple'",
          default: "'iso'",
          description: 'How weeks are numbered: ISO 8601, or from the week holding 1 January.',
        },
        {
          name: 'wareki',
          type: 'boolean',
          default: 'false',
          description: 'Shows years as Japanese era years, such as 令和8年（2026）.',
        },
        {
          name: 'locale',
          type: 'string | undefined',
          default: 'LOCALE_ID',
          description:
            'Locale for dates and month and day names. Set undefined to use the browser’s language.',
        },
        {
          name: 'colorMode',
          type: "'light' | 'dark' | null",
          default: 'null',
          description: 'Forces a color mode for the calendar.',
        },
        {
          name: 'prevLabel',
          type: 'string',
          default: "'Previous month'",
          description: 'Accessible name of the previous month button.',
        },
        {
          name: 'nextLabel',
          type: 'string',
          default: "'Next month'",
          description: 'Accessible name of the next month button.',
        },
        {
          name: 'hideOutsideDays',
          type: 'boolean',
          default: 'false',
          description: 'Hides the neighboring months’ days. Always hidden with several months.',
        },
        {
          name: 'weekLabel',
          type: 'string',
          default: "'Week'",
          description: 'Accessible name of the week numbers column.',
        },
        {
          name: 'monthSelection',
          type: 'boolean',
          default: 'true',
          description: 'Makes the month in the header a button that shows the months to pick from.',
        },
        {
          name: 'yearSelection',
          type: 'boolean',
          default: 'true',
          description: 'Makes the year in the header a button that shows the years to pick from.',
        },
        {
          name: 'monthSelectionLabel',
          type: 'string',
          default: "'Choose month'",
          description: 'Description of the month button in the header.',
        },
        {
          name: 'yearSelectionLabel',
          type: 'string',
          default: "'Choose year'",
          description: 'Description of the year button in the header.',
        },
        {
          name: 'prevYearsLabel',
          type: 'string',
          default: "'Previous years'",
          description: 'Accessible name of the previous button while years are shown.',
        },
        {
          name: 'nextYearsLabel',
          type: 'string',
          default: "'Next years'",
          description: 'Accessible name of the next button while years are shown.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables the control. Forms also disable it through the form control.',
        },
      ],
      outputs: [
        {
          name: 'valueChange',
          type: 'BsDateValue',
          description: 'Emits the value when the user picks a date.',
        },
        {
          name: 'selectionComplete',
          type: 'BsDateValue',
          description: 'Emits when a date, or a range’s end date, is picked.',
        },
      ],
      methods: [
        {
          name: 'focus()',
          type: 'void',
          description: 'Moves focus to the selected date or today.',
        },
        {
          name: 'isDateDisabled(iso)',
          type: 'boolean',
          description: 'Whether a date is outside min and max or disabled.',
        },
      ],
    },
    {
      name: 'Date helpers',
      importFrom: 'bootstrap-ng/calendar',
      functions: [
        {
          name: 'parseIsoDate(value)',
          type: 'Date | null',
          description:
            'Parses an ISO date (YYYY-MM-DD) as a local date. Returns null for other text and for dates that don’t exist, such as 2026-02-30.',
        },
        {
          name: 'toIsoDate(year, month, day)',
          type: 'string',
          description:
            'Returns the ISO date of a local date. The month counts from 0 like Date, and overflowing months and days roll over.',
        },
        {
          name: 'selectedDates(value)',
          type: 'string[]',
          description:
            'Returns the valid dates of a BsDateValue as an array, for single, multiple and range values alike.',
        },
        {
          name: 'weekNumber(weekStart, firstWeekday?, numbering?)',
          type: 'number',
          description:
            "Returns the week number shown for a week starting on the weekStart date. firstWeekday defaults to 1 (Monday) and numbering to 'iso', like the weekNumbers option.",
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-calendar-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class CalendarPage {
  protected readonly page = PAGE;
}
