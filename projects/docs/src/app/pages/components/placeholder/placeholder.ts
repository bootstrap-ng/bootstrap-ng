import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { PlaceholderBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { PlaceholderSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Placeholder',
  lead: 'Loading placeholders, or skeletons, that show where content will appear.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/placeholder/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        '<code>bsPlaceholder</code> sets <code>.placeholder</code> and a <code>width</code> in grid columns. Hide placeholders from assistive technologies with <code>aria-hidden="true"</code>.',
      example: PlaceholderBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'sizes',
      title: 'Sizes and animation',
      description:
        'Set <code>size</code> to <code>xs</code>, <code>sm</code> or <code>lg</code>. Animate placeholders with <code>.placeholder-glow</code>, <code>.placeholder-wave</code> or <code>.placeholder-pulse</code> on a parent.',
      example: PlaceholderSizesExample,
      html: sizesHtml,
    },
  ],
  api: [
    {
      name: 'BsPlaceholder',
      selector: '[bsPlaceholder]',
      inputs: [
        {
          name: 'width',
          type: 'number',
          default: '12',
          description: 'Width in grid columns, from 1 to 12.',
        },
        {
          name: 'size',
          type: "'xs' | 'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Height of the placeholder.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-placeholder-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class PlaceholderPage {
  protected readonly page = PAGE;
}
