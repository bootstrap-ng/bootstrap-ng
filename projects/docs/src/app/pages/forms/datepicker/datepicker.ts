import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { DatepickerBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { DatepickerFieldExample } from './examples/field';
import fieldHtml from './examples/field.html' with { loader: 'text' };
import { DatepickerIconExample } from './examples/icon';
import iconHtml from './examples/icon.html' with { loader: 'text' };
import { DatepickerMinMaxExample } from './examples/min-max';
import min_maxHtml from './examples/min-max.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import min_maxTs from './examples/min-max.ts' with { loader: 'text' };
import { DatepickerMultipleExample } from './examples/multiple';
import multipleHtml from './examples/multiple.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import multipleTs from './examples/multiple.ts' with { loader: 'text' };
import { DatepickerRangeExample } from './examples/range';
import rangeHtml from './examples/range.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import rangeTs from './examples/range.ts' with { loader: 'text' };
import { DatepickerFirstWeekdayExample } from './examples/first-weekday';
import first_weekdayHtml from './examples/first-weekday.html' with { loader: 'text' };
import { DatepickerWeekNumbersExample } from './examples/week-numbers';
import week_numbersHtml from './examples/week-numbers.html' with { loader: 'text' };
import { DatepickerPlacementExample } from './examples/placement';
import placementHtml from './examples/placement.html' with { loader: 'text' };
import { DatepickerButtonExample } from './examples/button';
import buttonHtml from './examples/button.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import buttonTs from './examples/button.ts' with { loader: 'text' };
import { DatepickerInlineExample } from './examples/inline';
import inlineHtml from './examples/inline.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import inlineTs from './examples/inline.ts' with { loader: 'text' };
import { DatepickerDarkExample } from './examples/dark';
import darkHtml from './examples/dark.html' with { loader: 'text' };
import { DatepickerKeyboardExample } from './examples/keyboard';
import keyboardHtml from './examples/keyboard.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Datepicker',
  lead: 'A calendar and date picker popup, opened from an input or a button, with range selection, multiple months and more.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/datepicker/',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      description:
        'Add <code>bsDatepicker</code> to a text input. The calendar opens below it on focus or click, and closes after you pick a date, on <kbd>Escape</kbd>, on a click outside, or when focus leaves it. <kbd>↓</kbd> moves focus into the calendar. The value is an ISO date (<code>YYYY-MM-DD</code>), which the input shows and accepts when typed. On macOS and iPadOS the input gets <code>inputmode="numeric"</code>, so the iPad on-screen keyboard shows the keys a date needs; iPhones keep the default keyboard. Unlike Bootstrap’s datepicker, the calendar is rendered by Angular, with no Vanilla Calendar Pro dependency.',
      example: DatepickerBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'with-form-field',
      title: 'With form field',
      description:
        'Use a <a href="forms/field">form field</a> for a label, description and validation feedback.',
      example: DatepickerFieldExample,
      html: fieldHtml,
    },
    {
      id: 'with-icon',
      title: 'With icon',
      description:
        'Put the input in a <a href="forms/form-adorn">form adorn</a> with <code>end</code> for a calendar icon on the right. The calendar lines up with the adorn.',
      example: DatepickerIconExample,
      html: iconHtml,
    },
    {
      id: 'min-max-dates',
      title: 'Min and max dates',
      description:
        'Restrict the selectable dates with <code>min</code> and <code>max</code>, or with a <code>dateDisabled</code> function, such as one that disables weekends.',
      example: DatepickerMinMaxExample,
      html: min_maxHtml,
      ts: min_maxTs,
    },
    {
      id: 'multiple-dates',
      title: 'Multiple dates',
      description:
        'Set <code>selectionMode="multiple"</code> to pick several dates. The value is an array, and the calendar stays open while you pick.',
      example: DatepickerMultipleExample,
      html: multipleHtml,
      ts: multipleTs,
    },
    {
      id: 'date-range',
      title: 'Date range',
      description:
        'Set <code>selectionMode="range"</code> to pick a start and an end date, and <code>monthsCount</code> to show months side by side. The calendar closes once both dates are picked.',
      example: DatepickerRangeExample,
      html: rangeHtml,
      ts: rangeTs,
    },
    {
      id: 'first-day-of-week',
      title: 'First day of week',
      description:
        'Weeks start on Monday. Set <code>firstWeekday</code> to <code>0</code> to start on Sunday. Set <code>locale</code> for month and day names in another language.',
      example: DatepickerFirstWeekdayExample,
      html: first_weekdayHtml,
    },
    {
      id: 'week-numbers',
      title: 'Week numbers',
      description:
        'Add <code>weekNumbers</code> to show each week’s number before it. Weeks are numbered by ISO 8601, where week 1 holds the year’s first Thursday. Set <code>weekNumbering="simple"</code> to make week 1 the week holding 1 January, as in the US with <code>firstWeekday="0"</code>. The numbers are row headers of the date grid, so screen readers announce them with the dates.',
      example: DatepickerWeekNumbersExample,
      html: week_numbersHtml,
    },
    {
      id: 'placement',
      title: 'Placement',
      description:
        'Set <code>placement</code> to open the calendar elsewhere. It flips when there isn’t room.',
      example: DatepickerPlacementExample,
      html: placementHtml,
    },
    {
      id: 'button-trigger',
      title: 'Button trigger',
      description:
        'Use <code>bsDatepicker</code> on a button, for example for a dashboard date filter. A click opens the calendar and moves focus into it. Put the text in a <code>bsDatepickerDisplay</code> element to keep icons when a date is picked. Buttons show dates in the locale’s medium format; change it with <code>dateFormat</code>.',
      example: DatepickerButtonExample,
      html: buttonHtml,
      ts: buttonTs,
    },
    {
      id: 'inline-mode',
      title: 'Inline mode',
      description:
        'Use <code>bsCalendar</code> for an always-visible calendar. It takes the same options and binds to forms the same way.',
      example: DatepickerInlineExample,
      html: inlineHtml,
      ts: inlineTs,
    },
    {
      id: 'dark-mode',
      title: 'Dark mode',
      description:
        'The calendar is rendered next to its input, so it follows the surrounding color mode. Set <code>colorMode</code> to force one for the calendar only.',
      example: DatepickerDarkExample,
      html: darkHtml,
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description:
        'The trigger has <code>aria-haspopup="dialog"</code> and <code>aria-expanded</code>, and the popup is a labeled dialog. Dates form an ARIA grid with one date in the tab order: <kbd>←</kbd> <kbd>→</kbd> move by day, <kbd>↑</kbd> <kbd>↓</kbd> by week, <kbd>Home</kbd> and <kbd>End</kbd> to the start and end of the week, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> by month, and with <kbd>Shift</kbd> by year. Each date is labeled with its full date, today has <code>aria-current="date"</code>, and the month heading is announced when it changes.',
      example: DatepickerKeyboardExample,
      html: keyboardHtml,
    },
  ],
  api: [
    {
      name: 'BsDatepicker',
      selector: 'input[bsDatepicker], button[bsDatepicker]',
      exportAs: 'bsDatepicker',
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
          name: 'dateFormat',
          type: 'Intl.DateTimeFormatOptions | ((date, locale) => string) | null',
          default: 'null',
          description:
            'How dates are shown. Inputs show ISO dates by default, buttons the locale’s medium date.',
        },
        {
          name: 'placement',
          type: 'BsPlacement',
          default: "'bottom-start'",
          description: 'Where the calendar opens.',
        },
        {
          name: 'calendarLabel',
          type: 'string',
          default: "'Choose date'",
          description: 'Accessible name of the calendar popup.',
        },
        {
          name: 'open',
          type: 'boolean',
          default: 'false',
          description: 'Opens the calendar.',
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
          description: 'Emits the value when the user picks or types dates.',
        },
        {
          name: 'openChange',
          type: 'boolean',
          description: 'Emits when the calendar opens or closes.',
        },
      ],
      methods: [
        {
          name: 'show() / hide() / toggle()',
          type: 'void',
          description: 'Opens or closes the calendar.',
        },
        {
          name: 'focusCalendar()',
          type: 'void',
          description: 'Opens the calendar and moves focus into it.',
        },
        {
          name: 'isOpen',
          type: 'Signal<boolean>',
          description: 'Whether the calendar is open.',
        },
        {
          name: 'display',
          type: 'Signal<string>',
          description: 'The selected dates as text.',
        },
      ],
    },
    {
      name: 'BsDatepickerDisplay',
      selector: '[bsDatepickerDisplay]',
      inputs: [],
    },
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
  ],
};

@Component({
  selector: 'docs-datepicker-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class DatepickerPage {
  protected readonly page = PAGE;
}
