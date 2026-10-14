import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { InputGroupBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { InputGroupFieldExample } from './examples/field';
import fieldHtml from './examples/field.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import fieldTs from './examples/field.ts' with { loader: 'text' };
import { InputGroupButtonsExample } from './examples/buttons';
import buttonsHtml from './examples/buttons.html' with { loader: 'text' };
import { InputGroupMenusExample } from './examples/menus';
import menusHtml from './examples/menus.html' with { loader: 'text' };
import { InputGroupControlsExample } from './examples/controls';
import controlsHtml from './examples/controls.html' with { loader: 'text' };
import { InputGroupChecksExample } from './examples/checks';
import checksHtml from './examples/checks.html' with { loader: 'text' };
import { InputGroupMultipleExample } from './examples/multiple';
import multipleHtml from './examples/multiple.html' with { loader: 'text' };
import { InputGroupSizingExample } from './examples/sizing';
import sizingHtml from './examples/sizing.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Input group',
  lead: 'Text, buttons and menus attached to either side of a form control.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/input-group/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Put <code>bsInputGroupText</code> add-ons on either side of a <code>bsFormControl</code> in a <code>bsInputGroup</code>. Keep labels outside the group, and give inputs without a visible label an <code>aria-label</code>.',
      example: InputGroupBasicExample,
      html: basicHtml,
    },
    {
      id: 'with-field',
      title: 'With form field',
      description:
        'Put the group in a <code>bsFormField</code> for a label, help text and feedback. Feedback goes after the group, not inside it.',
      example: InputGroupFieldExample,
      html: fieldHtml,
      ts: fieldTs,
    },
    {
      id: 'buttons',
      title: 'Buttons',
      description: 'Use buttons with <code>.input-group-btn</code> for actions.',
      example: InputGroupButtonsExample,
      html: buttonsHtml,
    },
    {
      id: 'menus',
      title: 'Buttons with menus',
      description: 'Combine buttons with a <a href="components/menu">menu</a>.',
      example: InputGroupMenusExample,
      html: menusHtml,
    },
    {
      id: 'textarea-select-file',
      title: 'Textarea, select and file',
      description:
        'Groups adapt to textareas, and work with selects and file inputs. A <code>&lt;label&gt;</code> can be the add-on.',
      example: InputGroupControlsExample,
      html: controlsHtml,
    },
    {
      id: 'checks',
      title: 'Checkboxes and radios',
      description: 'Put a checkbox or radio in an add-on instead of text.',
      example: InputGroupChecksExample,
      html: checksHtml,
    },
    {
      id: 'multiple-inputs',
      title: 'Multiple inputs',
      description: 'Groups can hold several inputs, but validation styles only work with one.',
      example: InputGroupMultipleExample,
      html: multipleHtml,
    },
    {
      id: 'sizing',
      title: 'Sizing',
      description:
        'Set <code>size</code> on the group to <code>sm</code> or <code>lg</code>. Everything inside resizes.',
      example: InputGroupSizingExample,
      html: sizingHtml,
    },
  ],
  api: [
    {
      name: 'BsInputGroup',
      selector: '[bsInputGroup]',
      inputs: [
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of everything in the group.',
        },
      ],
    },
    {
      name: 'BsInputGroupText',
      selector: '[bsInputGroupText]',
      inputs: [],
    },
  ],
};

@Component({
  selector: 'docs-input-group-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class InputGroupPage {
  protected readonly page = PAGE;
}
