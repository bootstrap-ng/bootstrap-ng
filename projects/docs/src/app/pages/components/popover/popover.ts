import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { PopoverBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { PopoverPlacementExample } from './examples/placement';
import placementHtml from './examples/placement.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import placementTs from './examples/placement.ts' with { loader: 'text' };
import { PopoverTemplateExample } from './examples/template';
import templateHtml from './examples/template.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import templateTs from './examples/template.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Popover',
  lead: 'Popovers with an optional header, opened by clicking their trigger and positioned with Floating UI.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/popover/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Pass the body to <code>bsPopover</code> and the header to <code>popoverTitle</code>. Click the trigger again or press Escape to close it.',
      example: PopoverBasicExample,
      html: basicHtml,
    },
    {
      id: 'placement',
      title: 'Placement',
      description:
        'Set <code>placement</code> to <code>top</code>, <code>end</code>, <code>bottom</code> or <code>start</code>. Popovers flip when there is no room.',
      example: PopoverPlacementExample,
      html: placementHtml,
      ts: placementTs,
    },
    {
      id: 'template',
      title: 'Templates and triggers',
      description:
        'Pass <code>ng-template</code> references for rich content, and set <code>trigger="hover focus"</code> to open on hover and focus instead of click. Tab from the trigger moves into a popover with links or buttons, and Tab from its last control continues after the trigger. With <code>trigger="focus"</code>, the popover closes on the next click elsewhere, but clicks inside it don’t close it, so users can select its text or use its controls.',
      example: PopoverTemplateExample,
      html: templateHtml,
      ts: templateTs,
    },
  ],
  api: [
    {
      name: 'BsPopover',
      selector: '[bsPopover]',
      exportAs: 'bsPopover',
      inputs: [
        {
          name: 'bsPopover',
          type: 'string | TemplateRef',
          default: 'undefined',
          description: 'Content of the popover body.',
        },
        {
          name: 'popoverTitle',
          type: 'string | TemplateRef',
          default: 'undefined',
          description: 'Content of the header. Left out when empty.',
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
          default: "'click'",
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
  selector: 'docs-popover-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class PopoverPage {
  protected readonly page = PAGE;
}
