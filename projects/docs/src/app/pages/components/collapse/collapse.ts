import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { CollapseBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { CollapseModelExample } from './examples/model';
import modelHtml from './examples/model.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import modelTs from './examples/model.ts' with { loader: 'text' };
import { CollapseHorizontalExample } from './examples/horizontal';
import horizontalHtml from './examples/horizontal.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Collapse',
  lead: 'Show and hide content. Bootstrap 6 animates the size in CSS, so there is no JavaScript animation code.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/collapse/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Give the collapse a template reference and pass it to <code>bsCollapseToggle</code>. The toggle keeps <code>aria-expanded</code> and <code>aria-controls</code> up to date.',
      example: CollapseBasicExample,
      html: basicHtml,
    },
    {
      id: 'model',
      title: 'Two-way binding',
      description:
        'Bind <code>[(open)]</code> to control the collapse from any element. <code>shown</code> and <code>hidden</code> emit after the transition.',
      example: CollapseModelExample,
      html: modelHtml,
      ts: modelTs,
    },
    {
      id: 'horizontal',
      title: 'Horizontal',
      description:
        'Add <code>horizontal</code> to animate the width. Give the child element a fixed width.',
      example: CollapseHorizontalExample,
      html: horizontalHtml,
    },
  ],
  api: [
    {
      name: 'BsCollapse',
      selector: '[bsCollapse]',
      exportAs: 'bsCollapse',
      inputs: [
        {
          name: 'open',
          type: 'boolean',
          default: 'false',
          description: 'Whether the content is shown. Supports [(open)].',
        },
        {
          name: 'horizontal',
          type: 'boolean',
          default: 'false',
          description: 'Animates the width instead of the height.',
        },
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id, used for aria-controls.',
        },
      ],
      outputs: [
        {
          name: 'openChange',
          type: 'boolean',
          description: 'Emits when a method or toggle changes the state.',
        },
        {
          name: 'shown',
          type: 'void',
          description: 'Emits after the content is shown.',
        },
        {
          name: 'hidden',
          type: 'void',
          description: 'Emits after the content is hidden.',
        },
      ],
      methods: [
        {
          name: 'show()',
          type: 'void',
          description: 'Shows the content.',
        },
        {
          name: 'hide()',
          type: 'void',
          description: 'Hides the content.',
        },
        {
          name: 'toggle()',
          type: 'void',
          description: 'Toggles the content.',
        },
        {
          name: 'isOpen',
          type: 'Signal<boolean>',
          description: 'Current open state.',
        },
      ],
    },
    {
      name: 'BsCollapseToggle',
      selector: '[bsCollapseToggle]',
      inputs: [
        {
          name: 'bsCollapseToggle',
          type: 'BsCollapse',
          default: 'required',
          description: 'The collapse to toggle.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-collapse-page',
  imports: [DocsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<docs-page [page]="page" />',
})
export default class CollapsePage {
  protected readonly page = PAGE;
}
