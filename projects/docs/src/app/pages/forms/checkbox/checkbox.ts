import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { CheckboxBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { CheckboxFieldExample } from './examples/field';
import fieldHtml from './examples/field.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import fieldTs from './examples/field.ts' with { loader: 'text' };
import { CheckboxIndeterminateExample } from './examples/indeterminate';
import indeterminateHtml from './examples/indeterminate.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import indeterminateTs from './examples/indeterminate.ts' with { loader: 'text' };
import { CheckboxDescriptionExample } from './examples/description';
import descriptionHtml from './examples/description.html' with { loader: 'text' };
import { CheckboxThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import themesTs from './examples/themes.ts' with { loader: 'text' };
import { CheckboxDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
import { CheckboxSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Checkbox',
  lead: 'Native checkboxes with theme colors, sizes and an indeterminate state.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/checkbox/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Add <code>bsCheck</code> to an <code>&lt;input type="checkbox"&gt;</code>. Bootstrap draws the checked and indeterminate marks with a CSS mask.',
      example: CheckboxBasicExample,
      html: basicHtml,
    },
    {
      id: 'with-field',
      title: 'With form field',
      description:
        'Put the checkbox in a <code>bsFormField</code> with a <code>bsLabel</code>. Bind it with <code>[formControl]</code>, <code>[(ngModel)]</code>, <code>[formField]</code> or <code>[(checked)]</code>.',
      example: CheckboxFieldExample,
      html: fieldHtml,
      ts: fieldTs,
    },
    {
      id: 'indeterminate',
      title: 'Indeterminate',
      description:
        'There is no HTML attribute for the indeterminate state, so bind <code>[(indeterminate)]</code>. The browser clears it when the user toggles the checkbox. This “select all” checkbox is indeterminate while only some items are checked.',
      example: CheckboxIndeterminateExample,
      html: indeterminateHtml,
      ts: indeterminateTs,
    },
    {
      id: 'description',
      title: 'Description',
      description:
        'Put the label and a <code>bsFormText</code> in a <code>.form-field-content</code>. The checkbox’s <code>aria-describedby</code> points to the description.',
      example: CheckboxDescriptionExample,
      html: descriptionHtml,
    },
    {
      id: 'themes',
      title: 'Theme colors',
      description: 'Set <code>theme</code> to color the checked checkbox.',
      example: CheckboxThemesExample,
      html: themesHtml,
      ts: themesTs,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: 'Disabled checkboxes and their labels are shown lighter.',
      example: CheckboxDisabledExample,
      html: disabledHtml,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: 'Set <code>size</code> to <code>sm</code> or <code>lg</code>.',
      example: CheckboxSizesExample,
      html: sizesHtml,
    },
  ],
  api: [
    {
      name: 'BsCheck',
      selector: 'input[type=checkbox][bsCheck]',
      exportAs: 'bsCheck',
      inputs: [
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the checked checkbox.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of the checkbox.',
        },
        {
          name: 'indeterminate',
          type: 'boolean',
          default: 'false',
          description: 'Shows the indeterminate mark. Supports [(indeterminate)].',
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
          name: 'indeterminateChange',
          type: 'boolean',
          description: 'Emits false when the user toggles an indeterminate checkbox.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-checkbox-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class CheckboxPage {
  protected readonly page = PAGE;
}
