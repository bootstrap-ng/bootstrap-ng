import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { ComboboxBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { ComboboxFieldExample } from './examples/field';
import fieldHtml from './examples/field.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import fieldTs from './examples/field.ts' with { loader: 'text' };
import { ComboboxCustomExample } from './examples/custom';
import customHtml from './examples/custom.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import customTs from './examples/custom.ts' with { loader: 'text' };
import { ComboboxSearchExample } from './examples/search';
import searchHtml from './examples/search.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import searchTs from './examples/search.ts' with { loader: 'text' };
import { ComboboxGroupsExample } from './examples/groups';
import groupsHtml from './examples/groups.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import groupsTs from './examples/groups.ts' with { loader: 'text' };
import { ComboboxMultipleExample } from './examples/multiple';
import multipleHtml from './examples/multiple.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import multipleTs from './examples/multiple.ts' with { loader: 'text' };
import { ComboboxSizingExample } from './examples/sizing';
import sizingHtml from './examples/sizing.html' with { loader: 'text' };
import { ComboboxDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
import { ComboboxSubmissionExample } from './examples/submission';
import submissionHtml from './examples/submission.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Combobox',
  lead: 'A select-like button with rich options, search and multiple selection, built on the menu.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/combobox/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Point a <code>bsCombobox</code> button at a <code>bsComboboxMenu</code> of <code>bsComboboxOption</code> buttons. Its value is the selected option’s <code>value</code>, bound with <code>[formControl]</code>, <code>[(ngModel)]</code>, <code>[formField]</code> or <code>[(value)]</code>. The menu opens with a click, <kbd>Enter</kbd>, <kbd>Space</kbd> or the arrow keys, and arrow keys move between options.',
      example: ComboboxBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'with-form-field',
      title: 'With form field',
      description:
        'In a <code>bsFormField</code>, the label names the combobox, and help text and feedback describe it. The combobox follows its form control’s validation state.',
      example: ComboboxFieldExample,
      html: fieldHtml,
      ts: fieldTs,
    },
    {
      id: 'custom-content',
      title: 'Custom content',
      description:
        'Options are ordinary buttons, so they can hold icons (<code>.menu-item-icon</code>) and descriptions (<code>.menu-item-content</code> and <code>.menu-item-description</code>). The combobox shows the first <code>.menu-item-content</code> span, or set <code>label</code> on the option. Set <code>check</code> on the menu for check marks on selected options.',
      example: ComboboxCustomExample,
      html: customHtml,
      ts: customTs,
    },
    {
      id: 'search-menu-items',
      title: 'Search menu items',
      description:
        'Put a <code>bsComboboxSearch</code> input in a <code>.combobox-search</code> at the top of the menu to filter options by their text, ignoring case and accents. It gets focus when the menu opens, and <kbd>↓</kbd> moves to the options. Add a <code>bsComboboxNoResults</code> message for when nothing matches.',
      example: ComboboxSearchExample,
      html: searchHtml,
      ts: searchTs,
    },
    {
      id: 'groups',
      title: 'Groups',
      description: 'Label groups of options with <code>.menu-header</code> elements.',
      example: ComboboxGroupsExample,
      html: groupsHtml,
      ts: groupsTs,
    },
    {
      id: 'multiple-select',
      title: 'Multiple select',
      description:
        'Set <code>multiple</code> to select several options. The value is an array, the menu stays open while you pick, and the button shows the count when more than one is selected. Change that text with <code>countText</code>.',
      example: ComboboxMultipleExample,
      html: multipleHtml,
      ts: multipleTs,
    },
    {
      id: 'sizing',
      title: 'Sizing',
      description:
        'Set <code>size</code> to <code>sm</code> or <code>lg</code> to match form control sizes.',
      example: ComboboxSizingExample,
      html: sizingHtml,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description:
        'Disable the whole combobox with <code>disabled</code> or its form control, or single options with <code>disabled</code> on the option.',
      example: ComboboxDisabledExample,
      html: disabledHtml,
    },
    {
      id: 'form-submission',
      title: 'Form submission',
      description:
        'Set <code>name</code> to submit the value with a native form: the combobox renders a hidden input, with values joined by commas when <code>multiple</code>.',
      example: ComboboxSubmissionExample,
      html: submissionHtml,
    },
  ],
  api: [
    {
      name: 'BsCombobox',
      selector: 'button[bsCombobox]',
      exportAs: 'bsCombobox',
      inputs: [
        {
          name: 'menu',
          type: 'BsComboboxMenu',
          description: 'The menu of options. Required.',
        },
        {
          name: 'value',
          type: 'unknown',
          default: 'null',
          description: 'Selected option value, or an array with multiple. Supports [(value)].',
        },
        {
          name: 'multiple',
          type: 'boolean',
          default: 'false',
          description: 'Selects several options.',
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "''",
          description: 'Text shown when nothing is selected.',
        },
        {
          name: 'name',
          type: 'string | null',
          default: 'null',
          description: 'Name of a hidden input that submits the value with a native form.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of the button.',
        },
        {
          name: 'compareWith',
          type: '(a, b) => boolean',
          default: 'Object.is',
          description: 'Compares option values with the value.',
        },
        {
          name: 'countText',
          type: '(count: number) => string',
          default: '`${count} selected`',
          description: 'Text shown when several options are selected.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables the control. Forms also disable it through the form control.',
        },
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
      outputs: [
        {
          name: 'valueChange',
          type: 'unknown',
          description: 'Emits the value when the user selects an option.',
        },
      ],
      methods: [
        {
          name: 'select(value)',
          type: 'void',
          description: 'Selects an option, or toggles it with multiple.',
        },
        {
          name: 'isSelected(value)',
          type: 'boolean',
          description: 'Whether a value is selected.',
        },
        {
          name: 'show() / hide() / toggle()',
          type: 'void',
          description: 'Opens or closes the menu.',
        },
      ],
    },
    {
      name: 'BsComboboxMenu',
      selector: '[bsComboboxMenu]',
      exportAs: 'bsComboboxMenu',
      inputs: [
        {
          name: 'check',
          type: 'boolean',
          default: 'false',
          description: 'Shows check marks on selected options. Always on with multiple.',
        },
        {
          name: 'placement',
          type: 'BsPlacement',
          default: "'bottom-start'",
          description: 'Where the menu opens.',
        },
      ],
    },
    {
      name: 'BsComboboxOption',
      selector: 'button[bsComboboxOption]',
      exportAs: 'bsComboboxOption',
      inputs: [
        {
          name: 'value',
          type: 'unknown',
          description: 'Value of the option. Required.',
        },
        {
          name: 'label',
          type: 'string | undefined',
          default: 'undefined',
          description:
            'Text shown in the combobox when selected. Defaults to the first .menu-item-content span, or the text.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables the option.',
        },
      ],
    },
    {
      name: 'BsComboboxSearch',
      selector: 'input[bsComboboxSearch]',
      inputs: [],
    },
    {
      name: 'BsComboboxNoResults',
      selector: '[bsComboboxNoResults]',
      inputs: [],
    },
  ],
};

@Component({
  selector: 'docs-combobox-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class ComboboxPage {
  protected readonly page = PAGE;
}
