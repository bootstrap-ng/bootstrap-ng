import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';

interface ConfigRow {
  fn: string;
  path: string;
  inputs: string;
}

@Component({
  selector: 'docs-configuration',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './configuration.html',
})
export default class Configuration {
  protected readonly appConfig = `import { ApplicationConfig } from '@angular/core';
import { provideBsDialogConfig, provideBsTableConfig, provideBsTooltipConfig } from 'bootstrap-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBsDialogConfig({ backdrop: 'static' }),
    provideBsTableConfig({ hover: true, emptyText: 'Nothing here yet' }),
    provideBsTooltipConfig({ placement: 'bottom', delay: 300 }),
  ],
};`;

  protected readonly componentConfig = `import { Component } from '@angular/core';
import { BsTooltip, provideBsTooltipConfig } from 'bootstrap-ng';

@Component({
  selector: 'app-toolbar',
  imports: [BsTooltip],
  // Tooltips in this toolbar open below it, with the app's delay.
  providers: [provideBsTooltipConfig({ placement: 'bottom' })],
  templateUrl: './toolbar.html',
})
export class Toolbar {}`;

  protected readonly dateConfig = `import { ApplicationConfig } from '@angular/core';
import { provideBsCalendarConfig, provideBsDatepickerConfig } from 'bootstrap-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    // Every calendar and datepicker: weeks start on Sunday, with week numbers.
    provideBsCalendarConfig({ firstWeekday: 0, weekNumbers: true }),
    // Datepickers only: show the selected date as "March 5, 2026".
    provideBsDatepickerConfig({ dateFormat: { dateStyle: 'long' } }),
  ],
};`;

  protected readonly configs: ConfigRow[] = [
    {
      fn: 'provideBsAccordionConfig',
      path: '/components/accordion',
      inputs: 'size, flush, exclusive',
    },
    {
      fn: 'provideBsAlertConfig',
      path: '/components/alert',
      inputs: 'dismissible, closeLabel, animation',
    },
    { fn: 'provideBsBreadcrumbConfig', path: '/components/breadcrumb', inputs: 'divider, label' },
    {
      fn: 'provideBsCarouselConfig',
      path: '/components/carousel',
      inputs:
        'autoplay, interval, pauseOnHover, ends, keyboard, and pauseLabel and playLabel on bsCarouselPlayPause',
    },
    {
      fn: 'provideBsCloseButtonConfig',
      path: '/components/close-button',
      inputs: 'label (aria-label)',
    },
    {
      fn: 'provideBsDialogConfig',
      path: '/components/dialog',
      inputs: 'backdrop, keyboard, animation',
    },
    {
      fn: 'provideBsDrawerConfig',
      path: '/components/drawer',
      inputs: 'placement, scroll, backdrop, keyboard, animation',
    },
    {
      fn: 'provideBsMenuConfig',
      path: '/components/menu',
      inputs: 'placement, autoClose, and hover on bsSubmenu',
    },
    {
      fn: 'provideBsNavOverflowConfig',
      path: '/components/nav-overflow',
      inputs: 'moreText, moreLabel, iconPlacement',
    },
    {
      fn: 'provideBsPaginationConfig',
      path: '/components/pagination',
      inputs: 'maxPages, size, previousText, nextText, previousLabel, nextLabel',
    },
    {
      fn: 'provideBsPopoverConfig',
      path: '/components/popover',
      inputs: 'placement, trigger, delay, animation',
    },
    {
      fn: 'provideBsProgressConfig',
      path: '/components/progress',
      inputs: 'max, striped, animated',
    },
    {
      fn: 'provideBsScrollspyConfig',
      path: '/components/scrollspy',
      inputs: 'topMargin, smoothScroll',
    },
    { fn: 'provideBsSpinnerConfig', path: '/components/spinner', inputs: 'type, label' },
    {
      fn: 'provideBsTableConfig',
      path: '/components/table',
      inputs:
        'pageSize, stickyHeader, striped, hover, bordered, size, emptyText, loadingText, selectAllLabel, selectHeader, rowLabel, detailHeader, expandLabel, resizeLabel, sortAnnouncement',
    },
    {
      fn: 'provideBsToastConfig',
      path: '/components/toasts',
      inputs: 'autohide, delay, animation, live, and closeLabel for BsToaster',
    },
    {
      fn: 'provideBsTooltipConfig',
      path: '/components/tooltip',
      inputs: 'placement, trigger, delay, animation',
    },
    {
      fn: 'provideBsCalendarConfig',
      path: '/forms/datepicker',
      inputs:
        'firstWeekday, monthsCount, locale, prevLabel, nextLabel, hideOutsideDays, weekNumbers, weekNumbering, weekLabel',
    },
    {
      fn: 'provideBsChipInputConfig',
      path: '/forms/chips',
      inputs: 'separator, allowDuplicates, createOnBlur, dismissible, removeLabel',
    },
    { fn: 'provideBsComboboxConfig', path: '/forms/combobox', inputs: 'size, countText' },
    {
      fn: 'provideBsDatepickerConfig',
      path: '/forms/datepicker',
      inputs:
        'firstWeekday, monthsCount, weekNumbers, weekNumbering, locale, dateFormat, placement, calendarLabel',
    },
    {
      fn: 'provideBsFileDropzoneConfig',
      path: '/forms/file-dropzone',
      inputs:
        'maxFileSize, fileList, thumbnails, size, removeLabel, fileListLabel, formatSize, rejectionText',
    },
    { fn: 'provideBsFormControlConfig', path: '/forms/form-control', inputs: 'clearLabel' },
    {
      fn: 'provideBsStrengthConfig',
      path: '/forms/password-strength',
      inputs: 'variant, minLength, weights, thresholds, messages, ariaLabel (aria-label)',
    },
    { fn: 'provideBsRangeConfig', path: '/forms/range', inputs: 'bubble, formatter' },
    {
      fn: 'provideBsRatingConfig',
      path: '/forms/rating',
      inputs: 'max, allowHalf, resettable, theme, size, valueText',
    },
    {
      fn: 'provideBsTypeaheadConfig',
      path: '/forms/typeahead',
      inputs: 'minLength, debounce, placement, listLabel, resultsText',
    },
  ];
}
