import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { ValidationReactiveExample } from './examples/reactive';
import reactiveHtml from './examples/reactive.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import reactiveTs from './examples/reactive.ts' with { loader: 'text' };
import { ValidationValidExample } from './examples/valid';
import validHtml from './examples/valid.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import validTs from './examples/valid.ts' with { loader: 'text' };
import { ValidationNativeExample } from './examples/native';
import nativeHtml from './examples/native.html' with { loader: 'text' };
import { ValidationServerExample } from './examples/server';
import serverHtml from './examples/server.html' with { loader: 'text' };
import { ValidationTooltipsExample } from './examples/tooltips';
import tooltipsHtml from './examples/tooltips.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import tooltipsTs from './examples/tooltips.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Validation',
  lead: 'Validation styles that follow Angular form state, native constraints or the server.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/validation/',
  sections: [
    {
      id: 'how-it-works',
      title: 'Angular forms',
      description:
        'Controls follow the state of their Angular form control. Once a control is touched, or after the form is submitted, invalid controls get <code>.is-invalid</code> and <code>aria-invalid="true"</code>, and their <code>bsInvalidFeedback</code> is shown and joins their <code>aria-describedby</code>. Add <code>bsValidate</code> to the form so its controls also show errors after a submit, and so Bootstrap styles <code>:user-invalid</code> for controls without an Angular form control. Try submitting the form below.',
      example: ValidationReactiveExample,
      html: reactiveHtml,
      ts: reactiveTs,
    },
    {
      id: 'valid-styles',
      title: 'Success styles',
      description:
        'Use <code>bsValidate="valid"</code> to also show success styles and <code>bsValidFeedback</code> on valid controls.',
      example: ValidationValidExample,
      html: validHtml,
      ts: validTs,
    },
    {
      id: 'native',
      title: 'Native constraints',
      description:
        'Without Angular forms, <code>bsValidate</code> uses the browser’s constraint validation: attributes such as <code>required</code>, <code>type="email"</code> or <code>pattern</code>. It sets <code>novalidate</code> to hide the browser’s tooltips, blocks the submission while a constraint fails, and sets the validation state after the user leaves a control or submits the form.',
      example: ValidationNativeExample,
      html: nativeHtml,
    },
    {
      id: 'server-side',
      title: 'Server-side',
      description:
        'Set <code>validation</code> to <code>invalid</code> or <code>valid</code> to show a state from the server. It overrides the automatic state until you set it back to <code>auto</code>.',
      example: ValidationServerExample,
      html: serverHtml,
    },
    {
      id: 'tooltips',
      title: 'Tooltips',
      description:
        'Add <code>tooltip</code> to feedback to show it as a tooltip below the control. The field needs <code>position: relative</code>. Tooltips don’t suit checkboxes, radios and switches.',
      example: ValidationTooltipsExample,
      html: tooltipsHtml,
      ts: tooltipsTs,
    },
  ],
  api: [
    {
      name: 'BsValidate',
      selector: 'form[bsValidate]',
      exportAs: 'bsValidate',
      inputs: [
        {
          name: 'bsValidate',
          type: "'' | 'valid'",
          default: "''",
          description: 'valid also shows success styles on valid controls.',
        },
      ],
      methods: [
        {
          name: 'submitted',
          type: 'Signal<boolean>',
          description: 'True after the user tried to submit the form, until it is reset.',
        },
      ],
    },
    {
      name: 'BsInvalidFeedback',
      selector: '[bsInvalidFeedback]',
      inputs: [
        {
          name: 'tooltip',
          type: 'boolean',
          default: 'false',
          description: 'Shows the feedback as a tooltip.',
        },
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id. Generated when not set.',
        },
      ],
    },
    {
      name: 'BsValidFeedback',
      selector: '[bsValidFeedback]',
      inputs: [
        {
          name: 'tooltip',
          type: 'boolean',
          default: 'false',
          description: 'Shows the feedback as a tooltip.',
        },
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id. Generated when not set.',
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
  selector: 'docs-validation-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class ValidationPage {
  protected readonly page = PAGE;
}
