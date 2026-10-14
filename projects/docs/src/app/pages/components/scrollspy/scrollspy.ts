import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { ScrollspyBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Scrollspy',
  lead: 'Highlights the navigation link of the section scrolled into view.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/scrollspy/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Put <code>bsScrollspy</code> on the element that holds the sections and pass it the element that holds the links. Each link\u2019s <code>href</code> is <code>#</code> and a section id. The active link gets <code>.active</code> and <code>aria-current="true"</code>. Clicking a link scrolls to its section without leaving the page; add <code>smoothScroll</code> to animate it.',
      example: ScrollspyBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
  ],
  api: [
    {
      name: 'BsScrollspy',
      selector: '[bsScrollspy]',
      exportAs: 'bsScrollspy',
      inputs: [
        {
          name: 'bsScrollspy',
          type: 'HTMLElement',
          default: 'required',
          description: 'The element holding the links.',
        },
        {
          name: 'topMargin',
          type: 'string',
          default: "'12%'",
          description: 'Position of the activation line, as a percentage or in pixels.',
        },
        {
          name: 'smoothScroll',
          type: 'boolean',
          default: 'false',
          description: 'Scrolls smoothly to a section when its link is clicked.',
        },
      ],
      outputs: [
        {
          name: 'activate',
          type: 'string',
          description: 'Emits the id of each section that becomes active.',
        },
      ],
      methods: [
        {
          name: 'refresh()',
          type: 'void',
          description: 'Finds the links and sections again.',
        },
        {
          name: 'activeId',
          type: 'Signal<string | null>',
          description: 'Id of the active section.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-scrollspy-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class ScrollspyPage {
  protected readonly page = PAGE;
}
