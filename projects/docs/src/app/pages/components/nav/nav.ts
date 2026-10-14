import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { NavBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { NavVariantsExample } from './examples/variants';
import variantsHtml from './examples/variants.html' with { loader: 'text' };
import { NavLayoutExample } from './examples/layout';
import layoutHtml from './examples/layout.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Nav',
  lead: 'Navigation lists styled as plain links, tabs, pills or underlines. To switch panels, use tabs instead.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/nav/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        '<code>bsNav</code> adds <code>.nav</code>, and <code>bsNavLink</code> adds <code>.nav-link</code>. <code>active</code> sets <code>aria-current="page"</code>, and <code>disabled</code> takes a link out of the tab order.',
      example: NavBasicExample,
      html: basicHtml,
    },
    {
      id: 'variants',
      title: 'Tabs, pills and underline',
      description:
        'Set <code>variant</code> to <code>tabs</code>, <code>pills</code> or <code>underline</code>.',
      example: NavVariantsExample,
      html: variantsHtml,
    },
    {
      id: 'layout',
      title: 'Vertical, fill and justify',
      description:
        '<code>vertical</code> stacks the links. <code>fill</code> and <code>justified</code> stretch them across the width, with <code>justified</code> making every item the same width.',
      example: NavLayoutExample,
      html: layoutHtml,
    },
  ],
  api: [
    {
      name: 'BsNav',
      selector: '[bsNav]',
      inputs: [
        {
          name: 'variant',
          type: "'tabs' | 'pills' | 'underline' | null",
          default: 'null',
          description: 'Style of the links.',
        },
        {
          name: 'vertical',
          type: 'boolean',
          default: 'false',
          description: 'Stacks the links.',
        },
        {
          name: 'fill',
          type: 'boolean',
          default: 'false',
          description: 'Stretches the items, each as wide as its content.',
        },
        {
          name: 'justified',
          type: 'boolean',
          default: 'false',
          description: 'Stretches the items to the same width.',
        },
      ],
    },
    {
      name: 'BsNavLink',
      selector: 'a[bsNavLink], button[bsNavLink]',
      inputs: [
        {
          name: 'active',
          type: 'boolean',
          default: 'false',
          description: 'Marks the current link.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables the link.',
        },
        {
          name: 'current',
          type: 'string',
          default: "'page'",
          description: 'Value of aria-current when active.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-nav-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class NavPage {
  protected readonly page = PAGE;
}
