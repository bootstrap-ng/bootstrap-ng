import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { BreadcrumbBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { BreadcrumbDividersExample } from './examples/dividers';
import dividersHtml from './examples/dividers.html' with { loader: 'text' };
import { BreadcrumbRouterExample } from './examples/router';
import routerHtml from './examples/router.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import routerTs from './examples/router.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Breadcrumb',
  lead: 'Shows the current page\u2019s location within the site\u2019s hierarchy.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/breadcrumb/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Pass the pages from the top level down to the current page as <code>items</code>. Items with an <code>href</code> are links, and the last item is the current page with <code>aria-current="page"</code>.',
      example: BreadcrumbBasicExample,
      html: basicHtml,
    },
    {
      id: 'dividers',
      title: 'Text dividers',
      description:
        'Bootstrap\u2019s chevron icon is the default divider. Set <code>divider</code> to use text instead.',
      example: BreadcrumbDividersExample,
      html: dividersHtml,
    },
    {
      id: 'router',
      title: 'Router links',
      description:
        'Use a <code>bsBreadcrumbLink</code> template to render each item yourself, for example with <code>routerLink</code>. The template gets the item and whether it is the current page. Set <code>label</code> to change the landmark\u2019s accessible name.',
      example: BreadcrumbRouterExample,
      html: routerHtml,
      ts: routerTs,
    },
  ],
  api: [
    {
      name: 'BsBreadcrumb',
      selector: 'nav[bsBreadcrumb]',
      exportAs: 'bsBreadcrumb',
      inputs: [
        {
          name: 'items',
          type: 'BsBreadcrumbItem[]',
          default: 'required',
          description: 'Pages from the top level down to the current page: { label, href? }.',
        },
        {
          name: 'divider',
          type: 'string',
          default: "''",
          description: 'Divider text. Empty uses Bootstrap\u2019s chevron icon.',
        },
        {
          name: 'label',
          type: 'string',
          default: "'Breadcrumb'",
          description: 'Accessible name of the navigation landmark.',
        },
      ],
    },
    {
      name: 'BsBreadcrumbLink',
      selector: 'ng-template[bsBreadcrumbLink]',
      inputs: [],
    },
  ],
};

@Component({
  selector: 'docs-breadcrumb-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class BreadcrumbPage {
  protected readonly page = PAGE;
}
