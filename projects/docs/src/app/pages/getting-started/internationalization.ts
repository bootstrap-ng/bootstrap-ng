import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';
import { DocsExample } from '../../shared/example';
import { I18nLabelsExample } from './examples/i18n-labels';
import labelsHtml from './examples/i18n-labels.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import labelsTs from './examples/i18n-labels.ts' with { loader: 'text' };
import { I18nLocalesExample } from './examples/i18n-locales';
import localesHtml from './examples/i18n-locales.html' with { loader: 'text' };
import { I18nRtlExample } from './examples/i18n-rtl';
import rtlHtml from './examples/i18n-rtl.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import rtlTs from './examples/i18n-rtl.ts' with { loader: 'text' };

interface LabelRow {
  name: string;
  path: string;
  inputs: string;
}

@Component({
  selector: 'docs-internationalization',
  imports: [DocsCode, DocsExample, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './internationalization.html',
})
export default class Internationalization {
  protected readonly localesExample = I18nLocalesExample;
  protected readonly localesHtml: string = localesHtml;
  protected readonly labelsExample = I18nLabelsExample;
  protected readonly labelsHtml: string = labelsHtml;
  protected readonly labelsTs: string = labelsTs;
  protected readonly rtlExample = I18nRtlExample;
  protected readonly rtlHtml: string = rtlHtml;
  protected readonly rtlTs: string = rtlTs;

  protected readonly localeId = `import { Component, inject, LOCALE_ID } from '@angular/core';
import { BsDatepicker, BsFormControl } from 'bootstrap-ng';

@Component({
  selector: 'app-due-date',
  imports: [BsDatepicker, BsFormControl],
  template: \`<input type="text" bsFormControl bsDatepicker [locale]="locale" aria-label="Due date" />\`,
})
export class DueDate {
  protected readonly locale = inject(LOCALE_ID);
}`;

  protected readonly dateFormat = `<!-- Intl.DateTimeFormat options, in the datepicker's locale -->
<input type="text" bsFormControl bsDatepicker locale="en-GB" [dateFormat]="{ dateStyle: 'medium' }" />

<!-- Or a function, such as one that uses Angular's formatDate() -->
<input type="text" bsFormControl bsDatepicker [dateFormat]="format" />`;

  protected readonly formatDate = `import { formatDate } from '@angular/common';
import { BsDateFormatter } from 'bootstrap-ng';

protected readonly format: BsDateFormatter = (date, locale) =>
  formatDate(date, 'EEE d MMM y', locale ?? 'en-US');`;

  protected readonly weekInfo = `export class DueDate {
  protected readonly locale = inject(LOCALE_ID);
  // getWeekInfo() returns 1 to 7 for Monday to Sunday; firstWeekday takes 0 for Sunday.
  // Fall back to Monday where Intl.Locale.getWeekInfo() isn't supported.
  protected readonly firstWeekday =
    (new Intl.Locale(this.locale).getWeekInfo?.().firstDay ?? 1) % 7;
}`;

  protected readonly i18nAttributes = `<div bsAlert dismissible closeLabel="Close" i18n-closeLabel i18n>Changes saved.</div>

<nav
  bsPagination
  aria-label="Pages"
  i18n-aria-label
  previousText="Previous"
  i18n-previousText
  nextText="Next"
  i18n-nextText
  [pageCount]="pageCount()"></nav>`;

  protected readonly localize = `protected readonly valueText = (value: number, max: number) =>
  $localize\`\${value}:value: out of \${max}:max: stars\`;`;

  protected readonly rtlDocument = `<!doctype html>
<html lang="ar" dir="rtl">
  …
</html>`;

  protected readonly rtlBinding = `import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';

@Component({ … })
export class App {
  private readonly document = inject(DOCUMENT);
  protected readonly language = signal<'en' | 'ar'>('en');

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      root.lang = this.language();
      root.dir = this.language() === 'ar' ? 'rtl' : 'ltr';
    });
  }
}`;

  protected readonly labels: LabelRow[] = [
    { name: 'Alert', path: '/components/alert', inputs: 'closeLabel' },
    { name: 'Breadcrumb', path: '/components/breadcrumb', inputs: 'label' },
    {
      name: 'Carousel',
      path: '/components/carousel',
      inputs: 'pauseLabel and playLabel, and aria-label on bsCarouselItem and bsCarouselIndicator',
    },
    { name: 'Close button', path: '/components/close-button', inputs: 'aria-label' },
    {
      name: 'Nav overflow',
      path: '/components/nav-overflow',
      inputs: 'moreText, moreLabel',
    },
    {
      name: 'Pagination',
      path: '/components/pagination',
      inputs: 'previousText, nextText, previousLabel, nextLabel',
    },
    { name: 'Spinner', path: '/components/spinner', inputs: 'label' },
    {
      name: 'Table',
      path: '/components/table',
      inputs:
        'emptyText, loadingText, selectAllLabel, selectHeader, rowLabel, detailHeader, expandLabel, resizeLabel, sortAnnouncement',
    },
    { name: 'Chips', path: '/forms/chips', inputs: 'removeLabel, and aria-label on bsChipDismiss' },
    { name: 'Combobox', path: '/forms/combobox', inputs: 'countText' },
    {
      name: 'Datepicker',
      path: '/forms/datepicker',
      inputs: 'calendarLabel, and prevLabel, nextLabel and weekLabel on bsCalendar',
    },
    {
      name: 'File dropzone',
      path: '/forms/file-dropzone',
      inputs: 'removeLabel, fileListLabel, formatSize, rejectionText',
    },
    { name: 'Form control', path: '/forms/form-control', inputs: 'clearLabel' },
    {
      name: 'Password strength',
      path: '/forms/password-strength',
      inputs: 'messages, aria-label',
    },
    { name: 'Range', path: '/forms/range', inputs: 'formatter' },
    { name: 'Rating', path: '/forms/rating', inputs: 'valueText' },
    { name: 'Typeahead', path: '/forms/typeahead', inputs: 'listLabel, resultsText' },
  ];
}
