import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { RangeBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { RangeReactiveExample } from './examples/reactive';
import reactiveHtml from './examples/reactive.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import reactiveTs from './examples/reactive.ts' with { loader: 'text' };
import { RangeDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
import { RangeStepsExample } from './examples/steps';
import stepsHtml from './examples/steps.html' with { loader: 'text' };
import { RangeBubbleExample } from './examples/bubble';
import bubbleHtml from './examples/bubble.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import bubbleTs from './examples/bubble.ts' with { loader: 'text' };
import { RangeThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
import { RangeTicksExample } from './examples/ticks';
import ticksHtml from './examples/ticks.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Range',
  lead: 'Range inputs with a filled track, a value bubble and tick marks.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/range/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Put a <code>bsRange</code> range input in a <code>bsRange</code> wrapper. The wrapper keeps <code>--bs-range-fill</code> in sync with the value, which Bootstrap’s CSS uses to fill the track. Bootstrap needs its JavaScript for this, bootstrap-ng does it in Angular.',
      example: RangeBasicExample,
      html: basicHtml,
    },
    {
      id: 'angular-forms',
      title: 'With Angular forms',
      description:
        'Bind the input with <code>[formControl]</code>, <code>[(ngModel)]</code> or <code>[formField]</code>. Values set from code update the fill too. The wrapper also emits <code>valueChange</code> with the numeric value.',
      example: RangeReactiveExample,
      html: reactiveHtml,
      ts: reactiveTs,
    },
    {
      id: 'themes',
      title: 'Theme colors',
      description:
        'Set <code>theme</code> on the wrapper to color the filled track and the thumb. It defaults to primary.',
      example: RangeThemesExample,
      html: themesHtml,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: 'Add <code>disabled</code> to the input.',
      example: RangeDisabledExample,
      html: disabledHtml,
    },
    {
      id: 'min-max-step',
      title: 'Min, max and steps',
      description:
        'Set <code>min</code>, <code>max</code> and <code>step</code> on the input. They default to 0, 100 and 1.',
      example: RangeStepsExample,
      html: stepsHtml,
    },
    {
      id: 'value-bubble',
      title: 'Value bubble',
      description:
        'Add <code>bubble</code> to the wrapper to show the value above the thumb, and pass a <code>formatter</code> to change its text. The bubble is hidden from screen readers, which announce the input’s value.',
      example: RangeBubbleExample,
      html: bubbleHtml,
      ts: bubbleTs,
    },
    {
      id: 'tick-marks',
      title: 'Tick marks',
      description:
        'Link a <code>&lt;datalist&gt;</code> with the input’s <code>list</code> attribute to render a tick for each option at its value. An option’s <code>label</code> is shown beneath its tick.',
      example: RangeTicksExample,
      html: ticksHtml,
    },
  ],
  api: [
    {
      name: 'BsRange',
      selector: 'div[bsRange]',
      exportAs: 'bsRange',
      inputs: [
        {
          name: 'bubble',
          type: 'boolean',
          default: 'false',
          description: 'Shows a bubble with the value above the thumb.',
        },
        {
          name: 'formatter',
          type: '(value: number) => string',
          default: 'String',
          description: 'Formats the value in the bubble.',
        },
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the filled track and thumb. Primary when not set.',
        },
      ],
      outputs: [
        {
          name: 'valueChange',
          type: 'number',
          description: 'Emits the numeric value when the user or a form changes it.',
        },
      ],
      methods: [
        {
          name: 'value',
          type: 'Signal<number>',
          description: 'Current numeric value.',
        },
      ],
    },
    {
      name: 'BsRangeInput',
      selector: 'input[type=range][bsRange]',
      exportAs: 'bsRangeInput',
      inputs: [
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id. Generated when not set, and used for the field’s label.',
        },
        {
          name: 'validation',
          type: "'auto' | 'valid' | 'invalid' | 'none'",
          default: "'auto'",
          description: 'Validation styles. auto follows the bound Angular form control.',
        },
      ],
      methods: [
        {
          name: 'update()',
          type: 'void',
          description: 'Syncs the wrapper after you set the input’s value directly on the element.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-range-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class RangePage {
  protected readonly page = PAGE;
}
