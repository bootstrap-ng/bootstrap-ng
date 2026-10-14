import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { SwitchBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { SwitchFieldExample } from './examples/field';
import fieldHtml from './examples/field.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import fieldTs from './examples/field.ts' with { loader: 'text' };
import { SwitchThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import themesTs from './examples/themes.ts' with { loader: 'text' };
import { SwitchDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
import { SwitchSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };
import { SwitchCustomWidthExample } from './examples/custom-width';
import custom_widthHtml from './examples/custom-width.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Switch',
  lead: 'A toggle switch built on a native checkbox.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/forms/switch/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Put a <code>bsSwitch</code> checkbox in a <code>bsSwitch</code> wrapper. The input gets <code>role="switch"</code> and the native <code>switch</code> attribute, which gives haptic feedback where supported.',
      example: SwitchBasicExample,
      html: basicHtml,
    },
    {
      id: 'with-field',
      title: 'With form field',
      description:
        'Put the switch in a <code>bsFormField</code> with a <code>bsLabel</code>, and bind the input like any checkbox.',
      example: SwitchFieldExample,
      html: fieldHtml,
      ts: fieldTs,
    },
    {
      id: 'themes',
      title: 'Theme colors',
      description: 'Set <code>theme</code> on the wrapper.',
      example: SwitchThemesExample,
      html: themesHtml,
      ts: themesTs,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description: 'Disabled switches and their labels are shown lighter.',
      example: SwitchDisabledExample,
      html: disabledHtml,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: 'Set <code>size</code> on the wrapper to <code>sm</code> or <code>lg</code>.',
      example: SwitchSizesExample,
      html: sizesHtml,
    },
    {
      id: 'custom-width',
      title: 'Custom width',
      description:
        'Override the <code>--bs-switch-width</code> and <code>--bs-switch-indicator-width</code> CSS variables for any width.',
      example: SwitchCustomWidthExample,
      html: custom_widthHtml,
    },
  ],
  api: [
    {
      name: 'BsSwitch',
      selector: 'div[bsSwitch]',
      exportAs: 'bsSwitch',
      inputs: [
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the checked switch.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of the switch.',
        },
      ],
    },
    {
      name: 'BsSwitchInput',
      selector: 'input[type=checkbox][bsSwitch]',
      exportAs: 'bsSwitchInput',
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
    },
  ],
};

@Component({
  selector: 'docs-switch-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class SwitchPage {
  protected readonly page = PAGE;
}
