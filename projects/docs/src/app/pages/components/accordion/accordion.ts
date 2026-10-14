import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { AccordionBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { AccordionThemeExample } from './examples/theme';
import themeHtml from './examples/theme.html' with { loader: 'text' };
import { AccordionMultipleExample } from './examples/multiple';
import multipleHtml from './examples/multiple.html' with { loader: 'text' };
import { AccordionModelExample } from './examples/model';
import modelHtml from './examples/model.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import modelTs from './examples/model.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Accordion',
  lead: 'Vertically collapsing sections built on native <details> and <summary> elements.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/accordion/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Items that share a group open one at a time, like Bootstrap’s exclusive accordion. Add the <code>open</code> attribute to show an item at first.',
      example: AccordionBasicExample,
      html: basicHtml,
    },
    {
      id: 'theme',
      title: 'Theme and size',
      description:
        'Use <code>theme</code> to color open items and <code>size="sm"</code> for a compact accordion.',
      example: AccordionThemeExample,
      html: themeHtml,
    },
    {
      id: 'multiple',
      title: 'Always open and flush',
      description:
        'Set <code>[exclusive]="false"</code> to let several items stay open. Add <code>flush</code> to remove the outer borders.',
      example: AccordionMultipleExample,
      html: multipleHtml,
    },
    {
      id: 'model',
      title: 'Two-way binding',
      description:
        'Bind <code>[(open)]</code> on an item to control it from your component. The binding also updates when the user opens or closes the item.',
      example: AccordionModelExample,
      html: modelHtml,
      ts: modelTs,
    },
  ],
  api: [
    {
      name: 'BsAccordion',
      selector: '[bsAccordion]',
      exportAs: 'bsAccordion',
      inputs: [
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of open items.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'Accordion size.',
        },
        {
          name: 'flush',
          type: 'boolean',
          default: 'false',
          description: 'Removes the outer borders and rounded corners.',
        },
        {
          name: 'exclusive',
          type: 'boolean',
          default: 'true',
          description: 'Allows only one item to be open at a time.',
        },
        {
          name: 'name',
          type: 'string',
          default: 'generated',
          description: 'Group name shared by the <details> elements.',
        },
      ],
    },
    {
      name: 'BsAccordionItem',
      selector: 'details[bsAccordionItem]',
      exportAs: 'bsAccordionItem',
      inputs: [
        {
          name: 'open',
          type: 'boolean',
          default: 'false',
          description: 'Whether the item is open. Supports [(open)].',
        },
      ],
      outputs: [
        {
          name: 'openChange',
          type: 'boolean',
          description: 'Emits when the user opens or closes the item.',
        },
      ],
      methods: [
        {
          name: 'show()',
          type: 'void',
          description: 'Opens the item.',
        },
        {
          name: 'hide()',
          type: 'void',
          description: 'Closes the item.',
        },
        {
          name: 'toggle()',
          type: 'void',
          description: 'Toggles the item.',
        },
        {
          name: 'isOpen',
          type: 'Signal<boolean>',
          description: 'Current open state.',
        },
      ],
    },
    {
      name: 'BsAccordionHeader',
      selector: 'summary[bsAccordionHeader]',
      inputs: [],
    },
    {
      name: 'BsAccordionBody',
      selector: '[bsAccordionBody]',
      inputs: [],
    },
  ],
};

@Component({
  selector: 'docs-accordion-page',
  imports: [DocsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<docs-page [page]="page" />',
})
export default class AccordionPage {
  protected readonly page = PAGE;
}
