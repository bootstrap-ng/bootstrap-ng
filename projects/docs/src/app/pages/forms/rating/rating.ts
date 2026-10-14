import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { RatingBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { RatingHalfExample } from './examples/half';
import halfHtml from './examples/half.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import halfTs from './examples/half.ts' with { loader: 'text' };
import { RatingReadonlyExample } from './examples/readonly';
import readonlyHtml from './examples/readonly.html' with { loader: 'text' };
import { RatingResettableExample } from './examples/resettable';
import resettableHtml from './examples/resettable.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import resettableTs from './examples/resettable.ts' with { loader: 'text' };
import { RatingSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };
import { RatingThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
import { RatingCustomExample } from './examples/custom';
import customHtml from './examples/custom.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import customTs from './examples/custom.ts' with { loader: 'text' };
import { RatingDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
import { RatingFormsExample } from './examples/forms';
import formsHtml from './examples/forms.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import formsTs from './examples/forms.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Rating',
  lead: 'Star ratings for reviews and feedback, with keyboard support, half stars and a read-only mode for averages.',
  sections: [
    {
      id: 'how-it-works',
      title: 'How it works',
      description:
        'A <code>bsRating</code> is one <code>role="slider"</code> tab stop, named with <code>aria-label</code> or <code>aria-labelledby</code>. Hover previews a rating and a click sets it. Arrow keys change it by one star, and Home and End go to the lowest and highest rating. Its value is a number from 0 (not rated) to <code>max</code>; bind it with <code>[(value)]</code>, <code>[formControl]</code>, <code>[(ngModel)]</code> or <code>[formField]</code>.',
      example: RatingBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'half-stars',
      title: 'Half stars',
      description:
        'Set <code>allowHalf</code> to pick half stars: click the first half of a star, or press an arrow key to move by half a star.',
      example: RatingHalfExample,
      html: halfHtml,
      ts: halfTs,
    },
    {
      id: 'readonly',
      title: 'Read-only',
      description:
        'Set <code>readonly</code> to show a rating, such as an average, that can’t be changed. Fractional values fill stars partially. Screen readers still reach it and hear its value.',
      example: RatingReadonlyExample,
      html: readonlyHtml,
    },
    {
      id: 'resettable',
      title: 'Resettable',
      description:
        'Set <code>resettable</code> to let the rating be cleared back to 0: click the current rating again, or press Home, Delete or Backspace.',
      example: RatingResettableExample,
      html: resettableHtml,
      ts: resettableTs,
    },
    {
      id: 'sizes-and-count',
      title: 'Sizes and number of stars',
      description:
        'Set <code>size</code> to <code>sm</code> or <code>lg</code>, and <code>max</code> to change the number of stars.',
      example: RatingSizesExample,
      html: sizesHtml,
    },
    {
      id: 'themes',
      title: 'Themes',
      description:
        'Filled stars use the <code>warning</code> theme color. Set <code>theme</code> to use another one.',
      example: RatingThemesExample,
      html: themesHtml,
    },
    {
      id: 'custom-stars',
      title: 'Custom stars',
      description:
        'Put an <code>&lt;ng-template bsRatingStar&gt;</code> inside to draw your own symbol. The template gets how full the star is, from 0 to 1, as <code>let-fill</code>, and its position as <code>let-i="index"</code>. Mark the symbol <code>aria-hidden="true"</code>; the slider announces the value.',
      example: RatingCustomExample,
      html: customHtml,
      ts: customTs,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description:
        'Disable the rating, or its form control. A disabled rating leaves the tab order.',
      example: RatingDisabledExample,
      html: disabledHtml,
    },
    {
      id: 'with-forms',
      title: 'With forms',
      description:
        'In a <code>bsFormField</code>, the rating is described by the help text and shows feedback once it is touched and invalid. The empty stars turn red while it is invalid. Labels can’t point to a slider with <code>for</code>, so name it with <code>aria-labelledby</code>. Set <code>valueText</code> to translate what screen readers announce, such as “3 out of 5”.',
      example: RatingFormsExample,
      html: formsHtml,
      ts: formsTs,
    },
  ],
  api: [
    {
      name: 'BsRating',
      selector: 'div[bsRating]',
      exportAs: 'bsRating',
      inputs: [
        {
          name: 'value',
          type: 'number',
          default: '0',
          description: 'The rating, from 0 (not rated) to max. Supports [(value)].',
        },
        { name: 'max', type: 'number', default: '5', description: 'Number of stars.' },
        {
          name: 'allowHalf',
          type: 'boolean',
          default: 'false',
          description: 'Lets pointer and keyboard pick half stars.',
        },
        {
          name: 'readonly',
          type: 'boolean',
          default: 'false',
          description: 'Shows the rating without letting it change.',
        },
        {
          name: 'resettable',
          type: 'boolean',
          default: 'false',
          description:
            'Lets the rating be cleared by clicking the current rating, or with Home, Delete or Backspace.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables the rating. Forms set this through disable().',
        },
        {
          name: 'theme',
          type: 'BsTheme',
          default: "'warning'",
          description: 'Theme color of the filled stars.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of the stars.',
        },
        {
          name: 'valueText',
          type: '(value: number, max: number) => string',
          default: '“3 out of 5”',
          description: 'Text screen readers announce for a value.',
        },
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id.',
        },
        {
          name: 'validation',
          type: "'auto' | 'valid' | 'invalid' | 'none'",
          default: "'auto'",
          description: 'Validation styles. auto follows the bound Angular form control.',
        },
      ],
      outputs: [
        {
          name: 'valueChange',
          type: 'number',
          description: 'Emits the rating when it changes.',
        },
      ],
    },
    {
      name: 'BsRatingStar',
      selector: 'ng-template[bsRatingStar]',
    },
  ],
};

@Component({
  selector: 'docs-rating-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class RatingPage {
  protected readonly page = PAGE;
}
