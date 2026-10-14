import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { PaginationBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { PaginationManyExample } from './examples/many';
import manyHtml from './examples/many.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import manyTs from './examples/many.ts' with { loader: 'text' };
import { PaginationIconsExample } from './examples/icons';
import iconsHtml from './examples/icons.html' with { loader: 'text' };
import { PaginationVariantsExample } from './examples/variants';
import variantsHtml from './examples/variants.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Pagination',
  lead: 'Page navigation for long lists and search results, with previous and next buttons and ellipses when there are many pages.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/pagination/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Bind the current page with <code>[(page)]</code> and set <code>pageCount</code>. Give the <code>&lt;nav&gt;</code> an <code>aria-label</code> that says what it pages. The current page gets <code>aria-current="page"</code>.',
      example: PaginationBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'many',
      title: 'Many pages',
      description:
        'When there are more pages than <code>maxPages</code> (7 by default), the first and last page stay visible and ellipses replace the rest.',
      example: PaginationManyExample,
      html: manyHtml,
      ts: manyTs,
    },
    {
      id: 'icons',
      title: 'Working with icons',
      description:
        'Replace the previous and next text with <code>previousText</code> and <code>nextText</code>, and give them accessible names with <code>previousLabel</code> and <code>nextLabel</code>.',
      example: PaginationIconsExample,
      html: iconsHtml,
    },
    {
      id: 'variants',
      title: 'Sizing and themes',
      description:
        'Set <code>size</code> to <code>sm</code> or <code>lg</code>, and <code>theme</code> to color the active page.',
      example: PaginationVariantsExample,
      html: variantsHtml,
    },
  ],
  api: [
    {
      name: 'BsPagination',
      selector: 'nav[bsPagination]',
      exportAs: 'bsPagination',
      inputs: [
        {
          name: 'page',
          type: 'number',
          default: '1',
          description: 'Current page, starting at 1. Supports [(page)].',
        },
        {
          name: 'pageCount',
          type: 'number',
          default: 'required',
          description: 'Number of pages.',
        },
        {
          name: 'maxPages',
          type: 'number',
          default: '7',
          description: 'Most page buttons to show, including the first and last. At least 5.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Size of the pagination.',
        },
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the active page.',
        },
        {
          name: 'previousText',
          type: 'string',
          default: "'Previous'",
          description: 'Visible text of the previous button.',
        },
        {
          name: 'nextText',
          type: 'string',
          default: "'Next'",
          description: 'Visible text of the next button.',
        },
        {
          name: 'previousLabel',
          type: 'string | null',
          default: 'null',
          description: 'Accessible label of the previous button.',
        },
        {
          name: 'nextLabel',
          type: 'string | null',
          default: 'null',
          description: 'Accessible label of the next button.',
        },
      ],
      outputs: [
        {
          name: 'pageChange',
          type: 'number',
          description: 'Emits the new page.',
        },
      ],
      methods: [
        {
          name: 'select(page)',
          type: 'void',
          description: 'Goes to a page, clamped to the available pages.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-pagination-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class PaginationPage {
  protected readonly page = PAGE;
}
