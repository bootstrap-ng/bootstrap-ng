import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { FieldBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { FieldSelectExample } from './examples/select';
import selectHtml from './examples/select.html' with { loader: 'text' };
import { FieldTextareaExample } from './examples/textarea';
import textareaHtml from './examples/textarea.html' with { loader: 'text' };
import { FieldCheckboxExample } from './examples/checkbox';
import checkboxHtml from './examples/checkbox.html' with { loader: 'text' };
import { FieldRadioExample } from './examples/radio';
import radioHtml from './examples/radio.html' with { loader: 'text' };
import { FieldGroupedExample } from './examples/grouped';
import groupedHtml from './examples/grouped.html' with { loader: 'text' };
import { FieldCardsExample } from './examples/cards';
import cardsHtml from './examples/cards.html' with { loader: 'text' };
import { FieldSwitchExample } from './examples/switch';
import switchHtml from './examples/switch.html' with { loader: 'text' };
import { FieldOverheadLabelExample } from './examples/overhead-label';
import overhead_labelHtml from './examples/overhead-label.html' with { loader: 'text' };
import { FieldDescriptionsExample } from './examples/descriptions';
import descriptionsHtml from './examples/descriptions.html' with { loader: 'text' };
import { FieldValidationExample } from './examples/validation';
import validationHtml from './examples/validation.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import validationTs from './examples/validation.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Field',
  lead: 'A layout wrapper that places a control’s label, description and validation feedback.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/field/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        '<code>bsFormField</code> adds <code>.form-field</code>, a CSS grid that stacks the label, control, help text and feedback. The field generates an id for the control unless you set one, sets <code>for</code> on its <code>bsFormLabel</code> or <code>bsLabel</code>, and points the control’s <code>aria-describedby</code> to its <code>bsFormText</code>.',
      example: FieldBasicExample,
      html: basicHtml,
    },
    {
      id: 'select',
      title: 'Select',
      description: 'Works the same way with <code>&lt;select&gt;</code> elements.',
      example: FieldSelectExample,
      html: selectHtml,
    },
    {
      id: 'textarea',
      title: 'Textarea',
      description: 'And with <code>&lt;textarea&gt;</code> elements. Descriptions are optional.',
      example: FieldTextareaExample,
      html: textareaHtml,
    },
    {
      id: 'checkbox',
      title: 'Checkbox',
      description:
        'When a checkbox is a direct child, the field switches to two columns: the checkbox, then its label. Use <code>bsLabel</code>, which sets <code>for</code> without adding a class.',
      example: FieldCheckboxExample,
      html: checkboxHtml,
    },
    {
      id: 'radio',
      title: 'Radio',
      description:
        'Radios use the same two-column layout. Wrap each radio and its label in its own field.',
      example: FieldRadioExample,
      html: radioHtml,
    },
    {
      id: 'grouped',
      title: 'Grouped',
      description:
        'Wrap several fields in a <code>.form-group</code> to put related controls under a shared label. Use a <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code> so screen readers announce the group name.',
      example: FieldGroupedExample,
      html: groupedHtml,
    },
    {
      id: 'cards',
      title: 'Group cards',
      description:
        'Add <code>card</code> to each field for a card that highlights the selected option. Put the label and description in a <code>.form-field-content</code>.',
      example: FieldCardsExample,
      html: cardsHtml,
    },
    {
      id: 'switch',
      title: 'Switch',
      description: 'Switches also use the two-column layout.',
      example: FieldSwitchExample,
      html: switchHtml,
    },
    {
      id: 'overhead-label',
      title: 'Overhead label',
      description:
        'Add a <code>bsFormLabel</code> to put a title above a checkbox, radio or switch. It spans both columns.',
      example: FieldOverheadLabelExample,
      html: overhead_labelHtml,
    },
    {
      id: 'descriptions',
      title: 'Descriptions',
      description:
        'Add a <code>bsFormText</code> after the label. For checkboxes and radios, wrap the label and description in a <code>.form-field-content</code>.',
      example: FieldDescriptionsExample,
      html: descriptionsHtml,
    },
    {
      id: 'validation',
      title: 'Validation',
      description:
        '<code>bsInvalidFeedback</code> and <code>bsValidFeedback</code> stack correctly in a field for every control type. While the control shows a state, the matching feedback joins its <code>aria-describedby</code>. See <a href="forms/validation">Validation</a> for how states are set.',
      example: FieldValidationExample,
      html: validationHtml,
      ts: validationTs,
    },
  ],
  api: [
    {
      name: 'BsFormField',
      selector: '[bsFormField]',
      exportAs: 'bsFormField',
      inputs: [
        {
          name: 'card',
          type: 'boolean',
          default: 'false',
          description: 'Card style that highlights the selected checkbox or radio.',
        },
      ],
      methods: [
        {
          name: 'controlId',
          type: 'Signal<string | null>',
          description: 'Id of the first control in the field.',
        },
      ],
    },
    {
      name: 'BsFormLabel',
      selector: 'label[bsFormLabel]',
      inputs: [],
    },
    {
      name: 'BsLabel',
      selector: 'label[bsLabel]',
      inputs: [],
    },
    {
      name: 'BsFormText',
      selector: '[bsFormText]',
      inputs: [
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id. Generated when not set.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-field-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class FieldPage {
  protected readonly page = PAGE;
}
