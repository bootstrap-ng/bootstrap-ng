import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { NavbarBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { NavbarMenuExample } from './examples/menu';
import menuHtml from './examples/menu.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Navbar',
  lead: 'A responsive navigation header. Below its breakpoint the navigation collapses into a drawer opened by the toggler.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/navbar/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Put a <code>bsDrawer</code> inside a <code>.navbar</code> with a responsive <code>.md:navbar-expand</code> class, and open it with a <code>.navbar-toggler</code> that has <code>bsDrawerToggle</code>. From the breakpoint up, the navbar shows the drawer\u2019s content inline and hides the toggler. The drawer closes when the navbar expands.',
      example: NavbarBasicExample,
      html: basicHtml,
    },
    {
      id: 'menu',
      title: 'With a menu and search',
      description:
        'Navbars can hold <a href="components/menu">menus</a>, forms and buttons. This one expands from the <code>lg</code> breakpoint.',
      example: NavbarMenuExample,
      html: menuHtml,
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
          description:
            'Edge the drawer slides in from below the navbar breakpoint. See the drawer page for every input.',
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
  ],
};

@Component({
  selector: 'docs-navbar-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class NavbarPage {
  protected readonly page = PAGE;
}
