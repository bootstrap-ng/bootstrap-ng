import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { ButtonGroupBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { ButtonGroupToolbarExample } from './examples/toolbar';
import toolbarHtml from './examples/toolbar.html' with { loader: 'text' };
import { ButtonGroupSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Button group',
  lead: 'Group a series of buttons on one line, stack them in a column, or combine groups in a toolbar.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/button-group/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        '<code>bsButtonGroup</code> adds <code>.btn-group</code> and <code>role="group"</code>. Give each group an <code>aria-label</code>.',
      example: ButtonGroupBasicExample,
      html: basicHtml,
    },
    {
      id: 'toolbar',
      title: 'Toolbar',
      description:
        '<code>bsButtonToolbar</code> combines groups with <code>role="toolbar"</code>. The left and right arrow keys, Home and End move focus between its buttons.',
      example: ButtonGroupToolbarExample,
      html: toolbarHtml,
    },
    {
      id: 'sizes',
      title: 'Sizing and vertical',
      description:
        'Set <code>size</code> on the group instead of on every button, and add <code>vertical</code> to stack the buttons.',
      example: ButtonGroupSizesExample,
      html: sizesHtml,
    },
  ],
  api: [
    {
      name: 'BsButtonGroup',
      selector: '[bsButtonGroup]',
      inputs: [
        {
          name: 'size',
          type: "'xs' | 'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of every button in the group.',
        },
        {
          name: 'vertical',
          type: 'boolean',
          default: 'false',
          description: 'Stacks the buttons.',
        },
      ],
    },
    {
      name: 'BsButtonToolbar',
      selector: '[bsButtonToolbar]',
      inputs: [],
    },
  ],
};

@Component({
  selector: 'docs-button-group-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class ButtonGroupPage {
  protected readonly page = PAGE;
}
