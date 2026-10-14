import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { FloatingLabelsBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { FloatingLabelsValidationExample } from './examples/validation';
import validationHtml from './examples/validation.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import validationTs from './examples/validation.ts' with { loader: 'text' };
import { FloatingLabelsTextareasExample } from './examples/textareas';
import textareasHtml from './examples/textareas.html' with { loader: 'text' };
import { FloatingLabelsSelectsExample } from './examples/selects';
import selectsHtml from './examples/selects.html' with { loader: 'text' };
import { FloatingLabelsPlaintextExample } from './examples/plaintext';
import plaintextHtml from './examples/plaintext.html' with { loader: 'text' };
import { FloatingLabelsInputGroupsExample } from './examples/input-groups';
import input_groupsHtml from './examples/input-groups.html' with { loader: 'text' };
import { FloatingLabelsDateTimeExample } from './examples/date-time';
import date_timeHtml from './examples/date-time.html' with { loader: 'text' };
import { FloatingLabelsAlwaysExample } from './examples/always';
import alwaysHtml from './examples/always.html' with { loader: 'text' };
import { FloatingLabelsLayoutExample } from './examples/layout';
import layoutHtml from './examples/layout.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Floating labels',
  lead: 'Labels that float over their form controls.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/floating-labels/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Put a <code>bsLabel</code> and then a <code>bsFormControl</code> in a <code>bsFormFloating</code>. The label comes first so screen readers announce it before the value. Text controls need a non-empty <code>placeholder</code>, which Bootstrap’s CSS uses to detect an empty control. It stays hidden until the control is focused.',
      example: FloatingLabelsBasicExample,
      html: basicHtml,
    },
    {
      id: 'validation',
      title: 'Validation',
      description:
        'Validation styles work as for other controls. Put the floating label in a <code>bsFormField</code> for feedback.',
      example: FloatingLabelsValidationExample,
      html: validationHtml,
      ts: validationTs,
    },
    {
      id: 'textareas',
      title: 'Textareas',
      description:
        'For a taller textarea, set the <code>--bs-form-floating-height</code> CSS variable on the wrapper instead of <code>rows</code>.',
      example: FloatingLabelsTextareasExample,
      html: textareasHtml,
    },
    {
      id: 'selects',
      title: 'Selects',
      description:
        'Selects always show the floated label. Selects with <code>size</code> or <code>multiple</code> aren’t supported.',
      example: FloatingLabelsSelectsExample,
      html: selectsHtml,
    },
    {
      id: 'date-time',
      title: 'Date and time',
      description:
        'Date, time, <code>datetime-local</code>, month and week inputs also always show the floated label. They don’t support placeholders like text inputs, so they don’t need one.',
      example: FloatingLabelsDateTimeExample,
      html: date_timeHtml,
    },
    {
      id: 'disabled-plaintext',
      title: 'Disabled and plain text',
      description:
        'Disabled controls and <code>bsFormControl="plaintext"</code> work too, for example to switch between editing and showing a value.',
      example: FloatingLabelsPlaintextExample,
      html: plaintextHtml,
    },
    {
      id: 'input-groups',
      title: 'Input groups',
      description:
        'Floating labels also work in a <code>bsInputGroup</code>. The wrapper mirrors the control’s validation state, so the group’s borders stay right.',
      example: FloatingLabelsInputGroupsExample,
      html: input_groupsHtml,
    },
    {
      id: 'always',
      title: 'Always floating',
      description:
        'Add <code>always</code> to keep the label floated and the placeholder visible, even when the control is empty and unfocused.',
      example: FloatingLabelsAlwaysExample,
      html: alwaysHtml,
    },
    {
      id: 'layout',
      title: 'Layout',
      description: 'In a grid, put floating labels inside columns.',
      example: FloatingLabelsLayoutExample,
      html: layoutHtml,
    },
  ],
  api: [
    {
      name: 'BsFormFloating',
      selector: '[bsFormFloating]',
      exportAs: 'bsFormFloating',
      inputs: [
        {
          name: 'always',
          type: 'boolean',
          default: 'false',
          description: 'Keeps the label floated and the placeholder visible.',
        },
      ],
      methods: [
        {
          name: 'controlId',
          type: 'Signal<string | null>',
          description: 'Id of the control inside the wrapper.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-floating-labels-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class FloatingLabelsPage {
  protected readonly page = PAGE;
}
