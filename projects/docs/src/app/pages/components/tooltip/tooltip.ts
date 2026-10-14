import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { TooltipBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { TooltipTemplateExample } from './examples/template';
import templateHtml from './examples/template.html' with { loader: 'text' };
import { TooltipOptionsExample } from './examples/options';
import optionsHtml from './examples/options.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Tooltip',
  lead: 'Tooltips positioned with Floating UI, shown on hover and keyboard focus and dismissed with Escape.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/tooltip/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Pass the text to <code>bsTooltip</code> and choose a <code>placement</code>. The trigger gets <code>aria-describedby</code> while the tooltip is shown.',
      example: TooltipBasicExample,
      html: basicHtml,
    },
    {
      id: 'template',
      title: 'Rich content',
      description:
        'Pass an <code>ng-template</code> instead of text for formatted content. Text is always rendered as text, never as HTML.',
      example: TooltipTemplateExample,
      html: templateHtml,
    },
    {
      id: 'options',
      title: 'Triggers and delay',
      description:
        'Use <code>trigger</code> for <code>click</code> or <code>manual</code> control, and <code>delay</code> to wait before showing and hiding.',
      example: TooltipOptionsExample,
      html: optionsHtml,
    },
  ],
  api: [
    {
      name: 'BsTooltip',
      selector: '[bsTooltip]',
      exportAs: 'bsTooltip',
      inputs: [
        {
          name: 'bsTooltip',
          type: 'string | TemplateRef',
          default: 'undefined',
          description: 'Content of the tooltip. Nothing shows when empty.',
        },
        {
          name: 'placement',
          type: 'BsPlacement',
          default: "'top'",
          description:
            'Where the tip appears. start and end follow the text direction. Flips when there is no room.',
        },
        {
          name: 'trigger',
          type: 'string',
          default: "'hover focus'",
          description: 'Space-separated hover, focus, click, or manual.',
        },
        {
          name: 'delay',
          type: 'number',
          default: '0',
          description: 'Milliseconds before showing and hiding.',
        },
        {
          name: 'animation',
          type: 'boolean',
          default: 'true',
          description: 'Fades the tip in and out.',
        },
      ],
      outputs: [
        { name: 'shown', type: 'void', description: 'Emits after the tip is shown.' },
        { name: 'hidden', type: 'void', description: 'Emits after the tip is hidden and removed.' },
      ],
      methods: [
        { name: 'show()', type: 'Promise<void>', description: 'Shows the tip.' },
        { name: 'hide()', type: 'Promise<void>', description: 'Hides the tip.' },
        { name: 'toggle()', type: 'Promise<void>', description: 'Toggles the tip.' },
        { name: 'isOpen', type: 'Signal<boolean>', description: 'Whether the tip is shown.' },
      ],
    },
  ],
};

@Component({
  selector: 'docs-tooltip-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class TooltipPage {
  protected readonly page = PAGE;
}
