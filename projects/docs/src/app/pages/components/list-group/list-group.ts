import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { ListGroupBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { ListGroupActionsExample } from './examples/actions';
import actionsHtml from './examples/actions.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import actionsTs from './examples/actions.ts' with { loader: 'text' };
import { ListGroupVariantsExample } from './examples/variants';
import variantsHtml from './examples/variants.html' with { loader: 'text' };
import { ListGroupHorizontalExample } from './examples/horizontal';
import horizontalHtml from './examples/horizontal.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'List group',
  lead: 'Lists of items, links or buttons, with active, disabled and theme states.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/list-group/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        '<code>bsListGroupItem</code> adds <code>.list-group-item</code>. <code>active</code> adds <code>.active</code> and <code>aria-current="true"</code>.',
      example: ListGroupBasicExample,
      html: basicHtml,
    },
    {
      id: 'actions',
      title: 'Links and buttons',
      description:
        'Links and buttons get the hover and focus styles of <code>.list-group-item-action</code>. <code>disabled</code> sets <code>disabled</code> on buttons, and <code>aria-disabled</code> and <code>tabindex="-1"</code> on links.',
      example: ListGroupActionsExample,
      html: actionsHtml,
      ts: actionsTs,
    },
    {
      id: 'variants',
      title: 'Flush, numbered and themes',
      description:
        '<code>flush</code> removes the outer borders, <code>numbered</code> numbers the items of an <code>&lt;ol&gt;</code>, and <code>theme</code> colors an item.',
      example: ListGroupVariantsExample,
      html: variantsHtml,
    },
    {
      id: 'horizontal',
      title: 'Horizontal',
      description:
        'Set <code>horizontal</code> to lay the items out in a row, or to a breakpoint to start from. The responsive variants use container queries, so wrap the list in <code>.contains-inline</code>.',
      example: ListGroupHorizontalExample,
      html: horizontalHtml,
    },
  ],
  api: [
    {
      name: 'BsListGroup',
      selector: '[bsListGroup]',
      inputs: [
        {
          name: 'flush',
          type: 'boolean',
          default: 'false',
          description: 'Removes the outer borders and rounded corners.',
        },
        {
          name: 'numbered',
          type: 'boolean',
          default: 'false',
          description: 'Numbers the items.',
        },
        {
          name: 'horizontal',
          type: "boolean | 'sm' | 'md' | 'lg' | 'xl' | '2xl'",
          default: 'false',
          description: 'Lays the items out in a row, from a breakpoint up.',
        },
      ],
    },
    {
      name: 'BsListGroupItem',
      selector: '[bsListGroupItem]',
      inputs: [
        {
          name: 'active',
          type: 'boolean',
          default: 'false',
          description: 'Marks the current selection.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables the item.',
        },
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the item.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-list-group-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class ListGroupPage {
  protected readonly page = PAGE;
}
