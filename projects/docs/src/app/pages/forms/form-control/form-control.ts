import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { FormControlBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { FormControlReactiveExample } from './examples/reactive';
import reactiveHtml from './examples/reactive.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import reactiveTs from './examples/reactive.ts' with { loader: 'text' };
import { FormControlTextareaExample } from './examples/textarea';
import textareaHtml from './examples/textarea.html' with { loader: 'text' };
import { FormControlSelectExample } from './examples/select';
import selectHtml from './examples/select.html' with { loader: 'text' };
import { FormControlSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };
import { FormControlDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
import { FormControlPlaintextExample } from './examples/plaintext';
import plaintextHtml from './examples/plaintext.html' with { loader: 'text' };
import { FormControlColorExample } from './examples/color';
import colorHtml from './examples/color.html' with { loader: 'text' };
import { FormControlDatalistExample } from './examples/datalist';
import datalistHtml from './examples/datalist.html' with { loader: 'text' };
import { FormControlDateTimeExample } from './examples/date-time';
import date_timeHtml from './examples/date-time.html' with { loader: 'text' };
import { FormControlFileExample } from './examples/file';
import fileHtml from './examples/file.html' with { loader: 'text' };
import { FormControlGhostExample } from './examples/ghost';
import ghostHtml from './examples/ghost.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Form control',
  lead: 'Text inputs, textareas and selects with sizes, states and validation styles.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/forms/form-control/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Add <code>bsFormControl</code> to an <code>&lt;input&gt;</code>, <code>&lt;textarea&gt;</code> or <code>&lt;select&gt;</code>. Use the right <code>type</code>, such as <code>email</code>, so browsers offer the matching keyboard and autofill.',
      example: FormControlBasicExample,
      html: basicHtml,
    },
    {
      id: 'angular-forms',
      title: 'With Angular forms',
      description:
        '<code>bsFormControl</code> doesn’t replace Angular’s value accessors, so <code>[formControl]</code>, <code>formControlName</code>, <code>[(ngModel)]</code> and <code>[formField]</code> work as on any native input. The control’s state sets <code>.is-invalid</code> once it is touched.',
      example: FormControlReactiveExample,
      html: reactiveHtml,
      ts: reactiveTs,
    },
    {
      id: 'textarea',
      title: 'Textarea',
      description: 'Set the height with the <code>rows</code> attribute.',
      example: FormControlTextareaExample,
      html: textareaHtml,
    },
    {
      id: 'select',
      title: 'Select',
      description:
        'Bootstrap 6 styles <code>&lt;select&gt;</code> with <code>.form-control</code> too, including <code>multiple</code> and <code>size</code>.',
      example: FormControlSelectExample,
      html: selectHtml,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description:
        'Set <code>controlSize</code> to <code>sm</code> or <code>lg</code>. The input is not called <code>size</code> because that is a native attribute of inputs and selects.',
      example: FormControlSizesExample,
      html: sizesHtml,
    },
    {
      id: 'disabled',
      title: 'Disabled and readonly',
      description:
        'Add <code>disabled</code> to gray out a control, or <code>readonly</code> to prevent changes while keeping it focusable.',
      example: FormControlDisabledExample,
      html: disabledHtml,
    },
    {
      id: 'plaintext',
      title: 'Readonly plain text',
      description:
        'Use <code>bsFormControl="plaintext"</code> on a <code>readonly</code> input to style it as text, keeping the control’s margin and padding.',
      example: FormControlPlaintextExample,
      html: plaintextHtml,
    },
    {
      id: 'color',
      title: 'Color',
      description:
        'Inputs with <code>type="color"</code> get <code>.form-control-color</code> automatically.',
      example: FormControlColorExample,
      html: colorHtml,
    },
    {
      id: 'datalist',
      title: 'Datalists',
      description:
        'Link a <code>&lt;datalist&gt;</code> with <code>list</code> for suggestions. Add <code>caret</code> to show a caret like a select.',
      example: FormControlDatalistExample,
      html: datalistHtml,
    },
    {
      id: 'date-time',
      title: 'Date and time',
      description:
        'Date and time inputs need no extra options. Their appearance depends on the browser. For a consistent calendar across browsers, use <a href="forms/datepicker">Datepicker</a>.',
      example: FormControlDateTimeExample,
      html: date_timeHtml,
    },
    {
      id: 'file',
      title: 'File',
      description: 'File inputs are styled through <code>::file-selector-button</code>.',
      example: FormControlFileExample,
      html: fileHtml,
    },
    {
      id: 'ghost',
      title: 'Ghost',
      description:
        '<code>bsFormControl="ghost"</code> removes all input styles, for composites such as search bars where a wrapper draws the border. Give the wrapper a visible focus style with <code>:focus-within</code>.',
      example: FormControlGhostExample,
      html: ghostHtml,
    },
  ],
  api: [
    {
      name: 'BsFormControl',
      selector: 'input[bsFormControl], textarea[bsFormControl], select[bsFormControl]',
      exportAs: 'bsFormControl',
      inputs: [
        {
          name: 'bsFormControl',
          type: "'control' | 'plaintext' | 'ghost' | ''",
          default: "'control'",
          description: 'Style of the control. An empty value means control.',
        },
        {
          name: 'controlSize',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of the control.',
        },
        {
          name: 'caret',
          type: 'boolean',
          default: 'false',
          description: 'Shows a caret, for example on an input with a datalist.',
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
    },
    {
      name: 'BsControl',
      selector: '[bsControl]',
      exportAs: 'bsControl',
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
          name: 'state',
          type: "Signal<'valid' | 'invalid' | null>",
          description: 'The validation state the control shows.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-form-control-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class FormControlPage {
  protected readonly page = PAGE;
}
