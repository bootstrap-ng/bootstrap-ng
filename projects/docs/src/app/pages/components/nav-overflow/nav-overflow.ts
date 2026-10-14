import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { NavOverflowBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { NavOverflowKeepExample } from './examples/keep';
import keepHtml from './examples/keep.html' with { loader: 'text' };
import { NavOverflowOptionsExample } from './examples/options';
import optionsHtml from './examples/options.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Nav overflow',
  lead: 'Moves navigation links that do not fit into a \u201cMore\u201d menu, also known as the Priority+ pattern.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/nav-overflow/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Wrap a <code>.nav</code> in an element with <code>bsNavOverflow</code>. The wrapper\u2019s width decides what fits, so it also works in sidebars and cards. The menu shows copies of the links, and choosing one clicks the original, so <code>routerLink</code> and click handlers keep working. Resize the window to see links move.',
      example: NavOverflowBasicExample,
      html: basicHtml,
    },
    {
      id: 'keep',
      title: 'Keep items visible',
      description:
        'Add <code>.nav-overflow-keep</code> to items that must stay visible. Here the container is narrow, so only a few links fit.',
      example: NavOverflowKeepExample,
      html: keepHtml,
    },
    {
      id: 'options',
      title: 'Toggle text, icon and thresholds',
      description:
        '<code>moreText</code> changes the toggle text; leave it empty for an icon-only toggle labelled by <code>moreLabel</code>. <code>iconPlacement</code> moves the icon after the text, <code>threshold</code> keeps a minimum number of links visible, and <code>collapseBelow</code> moves every link into the menu below a breakpoint or width.',
      example: NavOverflowOptionsExample,
      html: optionsHtml,
    },
  ],
  api: [
    {
      name: 'BsNavOverflow',
      selector: '[bsNavOverflow]',
      exportAs: 'bsNavOverflow',
      inputs: [
        {
          name: 'moreText',
          type: 'string',
          default: "'More'",
          description: 'Toggle text. Empty shows only the icon.',
        },
        {
          name: 'moreLabel',
          type: 'string',
          default: "'More'",
          description: 'Accessible label of an icon-only toggle.',
        },
        {
          name: 'iconPlacement',
          type: "'start' | 'end'",
          default: "'start'",
          description: 'Side of the icon.',
        },
        {
          name: 'threshold',
          type: 'number',
          default: '0',
          description: 'Minimum number of links to keep visible.',
        },
        {
          name: 'collapseBelow',
          type: 'BsBreakpoint | number | null',
          default: 'null',
          description: 'Moves every link into the menu below this width.',
        },
      ],
      outputs: [
        {
          name: 'overflowChange',
          type: 'number',
          description: 'Emits the number of links in the menu.',
        },
      ],
      methods: [
        {
          name: 'update()',
          type: 'void',
          description: 'Measures again.',
        },
        {
          name: 'overflowCount',
          type: 'Signal<number>',
          description: 'Number of links in the menu.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-nav-overflow-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class NavOverflowPage {
  protected readonly page = PAGE;
}
