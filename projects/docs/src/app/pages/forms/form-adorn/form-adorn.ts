import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { FormAdornBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { FormAdornEndExample } from './examples/end';
import endHtml from './examples/end.html' with { loader: 'text' };
import { FormAdornFieldExample } from './examples/field';
import fieldHtml from './examples/field.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import fieldTs from './examples/field.ts' with { loader: 'text' };
import { FormAdornTextExample } from './examples/text';
import textHtml from './examples/text.html' with { loader: 'text' };
import { FormAdornSizingExample } from './examples/sizing';
import sizingHtml from './examples/sizing.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Form adorn',
  lead: 'Icons and text inside a form control, next to the input.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/forms/form-adorn/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        '<code>bsFormAdorn</code> goes on a <code>&lt;label&gt;</code> that looks like a form control and holds a <code>bsFormControl="ghost"</code> input. Clicking the icon or padding focuses the input, because the wrapper is its label. <code>bsFormAdornIcon</code> and <code>bsFormAdornText</code> set <code>aria-hidden</code>, so adornments don’t join the input’s name. Don’t put buttons inside the wrapper.',
      example: FormAdornBasicExample,
      html: basicHtml,
    },
    {
      id: 'end',
      title: 'End position',
      description:
        'Add <code>end</code> to show adornments after the input without changing the DOM order.',
      example: FormAdornEndExample,
      html: endHtml,
    },
    {
      id: 'with-field',
      title: 'With form field',
      description:
        'In a <code>bsFormField</code>, the <code>bsFormLabel</code> names the input and the <code>bsFormText</code> describes it. An element can have several labels, so the wrapper and the field label work together.',
      example: FormAdornFieldExample,
      html: fieldHtml,
      ts: fieldTs,
    },
    {
      id: 'text',
      title: 'Text adornments',
      description:
        'Use <code>bsFormAdornText</code> for currency symbols, units or domains. Put anything meaningful in the visible label too, because adornments are hidden from screen readers.',
      example: FormAdornTextExample,
      html: textHtml,
    },
    {
      id: 'sizing',
      title: 'Sizing',
      description: 'Set <code>size</code> to <code>sm</code> or <code>lg</code>.',
      example: FormAdornSizingExample,
      html: sizingHtml,
    },
  ],
  api: [
    {
      name: 'BsFormAdorn',
      selector: 'label[bsFormAdorn]',
      exportAs: 'bsFormAdorn',
      inputs: [
        {
          name: 'end',
          type: 'boolean',
          default: 'false',
          description: 'Shows adornments after the input.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of the wrapper.',
        },
      ],
    },
    {
      name: 'BsFormAdornIcon',
      selector: '[bsFormAdornIcon]',
      inputs: [],
    },
    {
      name: 'BsFormAdornText',
      selector: '[bsFormAdornText]',
      inputs: [],
    },
  ],
};

@Component({
  selector: 'docs-form-adorn-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class FormAdornPage {
  protected readonly page = PAGE;
}
