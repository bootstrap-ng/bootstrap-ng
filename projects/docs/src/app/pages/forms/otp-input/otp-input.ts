import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { OtpInputBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { OtpInputConnectedExample } from './examples/connected';
import connectedHtml from './examples/connected.html' with { loader: 'text' };
import { OtpInputPinExample } from './examples/pin';
import pinHtml from './examples/pin.html' with { loader: 'text' };
import { OtpInputSeparatorExample } from './examples/separator';
import separatorHtml from './examples/separator.html' with { loader: 'text' };
import { OtpInputSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };
import { OtpInputTypeExample } from './examples/type';
import typeHtml from './examples/type.html' with { loader: 'text' };
import { OtpInputDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import disabledTs from './examples/disabled.ts' with { loader: 'text' };
import { OtpInputValidationExample } from './examples/validation';
import validationHtml from './examples/validation.html' with { loader: 'text' };
import { OtpInputFieldExample } from './examples/field';
import fieldHtml from './examples/field.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import fieldTs from './examples/field.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'OTP input',
  lead: 'One-time passwords, PIN codes and verification codes, in a single accessible input drawn as separate slots.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/forms/otp-input/',
  sections: [
    {
      id: 'how-it-works',
      title: 'How it works',
      description:
        'Put one <code>bsOtpInput</code> in a <code>bsOtp</code>. Screen readers, password managers and SMS autofill see one ordinary text input, with <code>autocomplete="one-time-code"</code>, drawn as a slot per character. Its <code>maxlength</code> sets the number of slots. Typing overwrites the slot at the caret, clicking a slot moves to it, and pasting <code>123-456</code> drops the dash. Bind the input like any text input.',
      example: OtpInputBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'connected-inputs',
      title: 'Connected inputs',
      description:
        'Set <code>connected</code> to merge the slots into one field with shared borders.',
      example: OtpInputConnectedExample,
      html: connectedHtml,
    },
    {
      id: 'four-digit-pin',
      title: 'Four-digit PIN',
      description: 'Use a smaller <code>maxlength</code> for shorter codes.',
      example: OtpInputPinExample,
      html: pinHtml,
    },
    {
      id: 'with-separator',
      title: 'With separator',
      description:
        'Set <code>groups</code> to split the slots, for codes like 123-456. The separator is decorative and never part of the value; change it with <code>separator</code>.',
      example: OtpInputSeparatorExample,
      html: separatorHtml,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: 'Set <code>size</code> to <code>sm</code> or <code>lg</code>.',
      example: OtpInputSizesExample,
      html: sizesHtml,
    },
    {
      id: 'alphanumeric-and-masking',
      title: 'Alphanumeric and masking',
      description:
        'Only digits are accepted by default. Set <code>type</code> to <code>alphanumeric</code> or <code>alpha</code> to accept letters, which also changes the input’s <code>inputmode</code> and <code>pattern</code>. Set <code>mask</code> to show dots while keeping a text input, so the numeric keyboard and autofill still work.',
      example: OtpInputTypeExample,
      html: typeHtml,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: 'Disable the input, or its form control.',
      example: OtpInputDisabledExample,
      html: disabledHtml,
      ts: disabledTs,
    },
    {
      id: 'validation',
      title: 'Validation',
      description:
        'The slots follow the input’s validation state: from its form control, or set <code>validation</code> on the input.',
      example: OtpInputValidationExample,
      html: validationHtml,
    },
    {
      id: 'with-form-field',
      title: 'With form field',
      description:
        'In a <code>bsFormField</code>, the label and help text are linked to the input, and feedback shows when the code is invalid.',
      example: OtpInputFieldExample,
      html: fieldHtml,
      ts: fieldTs,
    },
  ],
  api: [
    {
      name: 'BsOtp',
      selector: 'div[bsOtp]',
      exportAs: 'bsOtp',
      inputs: [
        {
          name: 'type',
          type: "'numeric' | 'alphanumeric' | 'alpha'",
          default: "'numeric'",
          description: 'Characters the input accepts.',
        },
        {
          name: 'mask',
          type: 'boolean',
          default: 'false',
          description: 'Shows a dot instead of each character.',
        },
        {
          name: 'groups',
          type: 'number[] | null',
          default: 'null',
          description: 'Group sizes, with a separator between groups.',
        },
        {
          name: 'separator',
          type: 'string',
          default: "'·'",
          description: 'Character shown between groups.',
        },
        {
          name: 'connected',
          type: 'boolean',
          default: 'false',
          description: 'Merges the slots into one field.',
        },
        {
          name: 'size',
          type: "'sm' | 'lg' | null",
          default: 'null',
          description: 'Size of the slots.',
        },
      ],
      outputs: [
        {
          name: 'complete',
          type: 'string',
          description: 'Emits the code when every slot is filled.',
        },
      ],
    },
    {
      name: 'BsOtpInput',
      selector: 'input[bsOtpInput]',
      exportAs: 'bsOtpInput',
      inputs: [
        {
          name: 'maxlength',
          type: 'number',
          default: '6',
          description: 'Number of characters and slots.',
        },
        {
          name: 'autocomplete',
          type: 'string',
          default: "'one-time-code'",
          description: 'The input’s autocomplete.',
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
      methods: [
        {
          name: 'focus()',
          type: 'void',
          description: 'Focuses the input on the first empty slot.',
        },
        {
          name: 'clear()',
          type: 'void',
          description: 'Clears the value and focuses the input.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-otp-input-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class OtpInputPage {
  protected readonly page = PAGE;
}
