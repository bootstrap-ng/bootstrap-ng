import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { RadioBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { RadioFieldExample } from './examples/field';
import fieldHtml from './examples/field.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import fieldTs from './examples/field.ts' with { loader: 'text' };
import { RadioDescriptionExample } from './examples/description';
import descriptionHtml from './examples/description.html' with { loader: 'text' };
import { RadioThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import themesTs from './examples/themes.ts' with { loader: 'text' };
import { RadioDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
import { RadioSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Radio',
  lead: 'Native radios for choosing one option from many.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/radio/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description: 'Add <code>bsRadio</code> to an <code>&lt;input type="radio"&gt;</code>.',
      example: RadioBasicExample,
      html: basicHtml,
    },
    {
      id: 'with-field',
      title: 'With form field',
      description:
        'Put each radio in a <code>bsFormField</code>. Bind radios of a group to the same form control, or give them the same <code>name</code>.',
      example: RadioFieldExample,
      html: fieldHtml,
      ts: fieldTs,
    },
    {
      id: 'description',
      title: 'Description',
      description:
        'Put the label and a <code>bsFormText</code> in a <code>.form-field-content</code>.',
      example: RadioDescriptionExample,
      html: descriptionHtml,
    },
    {
      id: 'themes',
      title: 'Theme colors',
      description: 'Set <code>theme</code> to color the checked radio.',
      example: RadioThemesExample,
      html: themesHtml,
      ts: themesTs,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: 'Disabled radios and their labels are shown lighter.',
      example: RadioDisabledExample,
      html: disabledHtml,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: 'Set <code>size</code> to <code>sm</code> or <code>lg</code>.',
      example: RadioSizesExample,
      html: sizesHtml,
    },
  ],
  api: [
    {
      name: 'BsRadio',
      selector: 'input[type=radio][bsRadio]',
      exportAs: 'bsRadio',
      inputs: [
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the checked radio.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of the radio.',
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
  ],
};

@Component({
  selector: 'docs-radio-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class RadioPage {
  protected readonly page = PAGE;
}
