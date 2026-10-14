import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { DrawerBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { DrawerPlacementExample } from './examples/placement';
import placementHtml from './examples/placement.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import placementTs from './examples/placement.ts' with { loader: 'text' };
import { DrawerScrollingExample } from './examples/scrolling';
import scrollingHtml from './examples/scrolling.html' with { loader: 'text' };
import { DrawerStaticExample } from './examples/static';
import staticHtml from './examples/static.html' with { loader: 'text' };
import { DrawerServiceExample } from './examples/service';
import serviceHtml from './examples/service.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import serviceTs from './examples/service.ts' with { loader: 'text' };
import { DrawerResponsiveExample } from './examples/responsive';
import responsiveHtml from './examples/responsive.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Drawer',
  lead: 'A panel that slides in from an edge of the screen, built on the native dialog element. Bootstrap 6\u2019s replacement for offcanvas.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/drawer/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Open a drawer with <code>bsDrawerToggle</code>, which also keeps <code>aria-expanded</code> and <code>aria-controls</code> in sync. <code>bsDrawerClose</code> closes the drawer it is in. Modal drawers trap focus, close on Escape and on backdrop clicks, and stop the page from scrolling.',
      example: DrawerBasicExample,
      html: basicHtml,
    },
    {
      id: 'placement',
      title: 'Placement',
      description:
        'Set <code>placement</code> to <code>start</code> (the default), <code>end</code>, <code>top</code>, <code>bottom</code> or <code>fullscreen</code>. <code>start</code> and <code>end</code> follow the text direction.',
      example: DrawerPlacementExample,
      html: placementHtml,
      ts: placementTs,
    },
    {
      id: 'scrolling',
      title: 'Body scrolling',
      description:
        'Set <code>scroll</code> with <code>[backdrop]="false"</code> to keep the page scrollable and interactive. The drawer then opens without a backdrop and does not trap focus. With a backdrop, the drawer stays modal but the page still scrolls.',
      example: DrawerScrollingExample,
      html: scrollingHtml,
    },
    {
      id: 'static',
      title: 'Static backdrop',
      description:
        'With <code>backdrop="static"</code> the drawer does not close on backdrop clicks. Add <code>[keyboard]="false"</code> to ignore Escape as well.',
      example: DrawerStaticExample,
      html: staticHtml,
    },
    {
      id: 'responsive',
      title: 'Responsive',
      description:
        'Set <code>responsive</code> to a breakpoint to use Bootstrap\u2019s <code>.lg:drawer</code> style classes: the content is a drawer below the breakpoint and shows inline from it up. An open drawer closes when the viewport grows past the breakpoint.',
      example: DrawerResponsiveExample,
      html: responsiveHtml,
    },
    {
      id: 'service',
      title: 'Opening from code',
      description:
        'Call <code>openDrawer()</code> on <code>BsDialogService</code> with a component or template to show a drawer without writing the <code>&lt;dialog&gt;</code> yourself. A template gets the ref as its context, so it can <code>close()</code> with a value, and the ref’s <code>result</code> promise resolves with it. See <a href="components/dialog#service">opening a dialog from code</a> for the options.',
      example: DrawerServiceExample,
      html: serviceHtml,
      ts: serviceTs,
    },
  ],
  api: [
    {
      name: 'BsDrawer',
      selector: 'dialog[bsDrawer]',
      exportAs: 'bsDrawer',
      inputs: [
        {
          name: 'placement',
          type: "'start' | 'end' | 'top' | 'bottom' | 'fullscreen'",
          default: "'start'",
          description: 'Edge the drawer slides in from.',
        },
        {
          name: 'responsive',
          type: "'sm' | 'md' | 'lg' | 'xl' | '2xl' | null",
          default: 'null',
          description: 'Shows the content inline from this breakpoint up.',
        },
        {
          name: 'scroll',
          type: 'boolean',
          default: 'false',
          description: 'Keeps the page scrollable while the drawer is open.',
        },
        {
          name: 'open',
          type: 'boolean',
          default: 'false',
          description: 'Whether the drawer is open. Supports [(open)].',
        },
        {
          name: 'backdrop',
          type: "boolean | 'static'",
          default: 'true',
          description: 'Shows a backdrop. static keeps the drawer open on backdrop clicks.',
        },
        {
          name: 'keyboard',
          type: 'boolean',
          default: 'true',
          description: 'Closes the drawer on Escape.',
        },
        {
          name: 'animation',
          type: 'boolean',
          default: 'true',
          description: 'Slides the drawer in and out.',
        },
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id, used by toggles for aria-controls.',
        },
      ],
      outputs: [
        {
          name: 'openChange',
          type: 'boolean',
          description: 'Emits when the drawer opens or closes from inside.',
        },
        {
          name: 'shown',
          type: 'void',
          description: 'Emits after the drawer is shown.',
        },
        {
          name: 'hidden',
          type: 'void',
          description: 'Emits after the drawer is hidden.',
        },
        {
          name: 'dismissed',
          type: "'escape' | 'backdrop'",
          description: 'Emits when the user dismisses the drawer.',
        },
      ],
      methods: [
        {
          name: 'show()',
          type: 'void',
          description: 'Opens the drawer.',
        },
        {
          name: 'hide()',
          type: 'void',
          description: 'Closes the drawer.',
        },
        {
          name: 'toggle()',
          type: 'void',
          description: 'Toggles the drawer.',
        },
        {
          name: 'isOpen',
          type: 'Signal<boolean>',
          description: 'Current open state.',
        },
      ],
    },
    {
      name: 'BsDrawerToggle',
      selector: '[bsDrawerToggle]',
      inputs: [
        {
          name: 'bsDrawerToggle',
          type: 'BsDrawer',
          default: 'required',
          description: 'The drawer to open and close.',
        },
      ],
    },
    {
      name: 'BsDialogClose',
      selector: '[bsDrawerClose], [bsDialogClose]',
      inputs: [],
    },
  ],
};

@Component({
  selector: 'docs-drawer-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class DrawerPage {
  protected readonly page = PAGE;
}
