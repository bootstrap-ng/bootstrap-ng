import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { TabsBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { TabsPillsExample } from './examples/pills';
import pillsHtml from './examples/pills.html' with { loader: 'text' };
import { TabsModelExample } from './examples/model';
import modelHtml from './examples/model.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import modelTs from './examples/model.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Tab',
  lead: 'Tabbed interfaces built on Bootstrap\u2019s nav styles, with the WAI-ARIA tabs keyboard pattern.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/tab/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Give each <code>bsTab</code> and <code>bsTabPane</code> the same key, and pass the tab list to <code>bsTabContent</code>. Ids, <code>aria-controls</code>, <code>aria-labelledby</code> and <code>aria-selected</code> are set for you. Arrow keys, Home and End move between tabs and skip disabled ones.',
      example: TabsBasicExample,
      html: basicHtml,
    },
    {
      id: 'pills',
      title: 'Vertical pills',
      description:
        'Add <code>nav-pills</code> or <code>nav-underline</code> for other styles. Set <code>vertical</code> on a vertical list so screen readers announce its orientation.',
      example: TabsPillsExample,
      html: pillsHtml,
    },
    {
      id: 'model',
      title: 'Two-way binding',
      description:
        'Bind <code>[(active)]</code> to the key of the shown tab. Without it the first enabled tab is shown.',
      example: TabsModelExample,
      html: modelHtml,
      ts: modelTs,
    },
  ],
  api: [
    {
      name: 'BsTabs',
      selector: '[bsTabs]',
      exportAs: 'bsTabs',
      inputs: [
        {
          name: 'active',
          type: 'string | undefined',
          default: 'undefined',
          description: 'Key of the shown tab. Supports [(active)].',
        },
        {
          name: 'vertical',
          type: 'boolean',
          default: 'false',
          description: 'Sets aria-orientation="vertical".',
        },
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id, used to build tab and pane ids.',
        },
      ],
      methods: [
        { name: 'select(key)', type: 'void', description: 'Shows the tab with the given key.' },
        {
          name: 'selected',
          type: 'Signal<string | undefined>',
          description: 'Key of the shown tab.',
        },
      ],
    },
    {
      name: 'BsTab',
      selector: '[bsTab]',
      exportAs: 'bsTab',
      inputs: [
        { name: 'bsTab', type: 'string', default: 'required', description: 'Key of the tab.' },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description:
            'Disables the tab (disabled on buttons, aria-disabled and .disabled on links). A disabled active tab falls back to the first enabled tab.',
        },
      ],
    },
    {
      name: 'BsTabContent',
      selector: '[bsTabContent]',
      exportAs: 'bsTabContent',
      inputs: [
        {
          name: 'bsTabContent',
          type: 'BsTabs',
          default: 'required',
          description: 'The tab list whose panes this element holds.',
        },
        { name: 'animation', type: 'boolean', default: 'true', description: 'Fades panes in.' },
      ],
    },
    {
      name: 'BsTabPane',
      selector: '[bsTabPane]',
      exportAs: 'bsTabPane',
      inputs: [
        {
          name: 'bsTabPane',
          type: 'string',
          default: 'required',
          description: 'Key of the tab that shows this pane.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-tab-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class TabsPage {
  protected readonly page = PAGE;
}
