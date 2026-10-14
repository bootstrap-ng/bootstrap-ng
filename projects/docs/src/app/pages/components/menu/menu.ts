import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { MenuBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { MenuContentExample } from './examples/content';
import contentHtml from './examples/content.html' with { loader: 'text' };
import { MenuOptionsExample } from './examples/options';
import optionsHtml from './examples/options.html' with { loader: 'text' };
import { MenuSubmenusExample } from './examples/submenus';
import submenusHtml from './examples/submenus.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Menu',
  lead: 'Menus of actions and links, Bootstrap 6\u2019s replacement for dropdowns, positioned with Floating UI.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/menu/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Pass the menu\u2019s template reference to <code>bsMenuToggle</code>. ArrowDown and ArrowUp on the toggle open the menu and focus the first or last <code>.menu-item</code>; Escape closes it and returns focus to the toggle.',
      example: MenuBasicExample,
      html: basicHtml,
    },
    {
      id: 'menu-content',
      title: 'Menu content',
      description:
        'Use <code>.menu-header</code>, <code>.menu-divider</code>, <code>.active</code>, disabled items, themes and <code>.menu-translucent</code>. Arrow keys skip disabled items.',
      example: MenuContentExample,
      html: contentHtml,
    },
    {
      id: 'options',
      title: 'Placement and closing',
      description:
        "Set <code>placement</code> to position the menu, and <code>autoClose</code> to choose which clicks close it: <code>true</code>, <code>'inside'</code>, <code>'outside'</code> or <code>false</code>.",
      example: MenuOptionsExample,
      html: optionsHtml,
    },
    {
      id: 'submenus',
      title: 'Submenus',
      description:
        'Wrap a <code>.menu-item</code> trigger and a nested <code>.menu</code> in an element with <code>bsSubmenu</code>. Submenus open on hover or click, and with ArrowRight (ArrowLeft in right-to-left pages); ArrowLeft or Escape closes them and returns focus to the trigger. They can be nested, and flip to the other side when there is no room. Set <code>[hover]="false"</code> to open a submenu only on click and keyboard.',
      example: MenuSubmenusExample,
      html: submenusHtml,
    },
  ],
  api: [
    {
      name: 'BsMenu',
      selector: '[bsMenu]',
      exportAs: 'bsMenu',
      inputs: [
        {
          name: 'open',
          type: 'boolean',
          default: 'false',
          description: 'Whether the menu is open. Supports [(open)].',
        },
        {
          name: 'placement',
          type: 'BsPlacement',
          default: "'bottom-start'",
          description: 'Where the menu appears next to its toggle.',
        },
        {
          name: 'autoClose',
          type: "boolean | 'inside' | 'outside'",
          default: 'true',
          description: 'Which clicks close the menu.',
        },
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id, used for aria-controls on the toggle.',
        },
      ],
      outputs: [
        {
          name: 'openChange',
          type: 'boolean',
          description: 'Emits when the menu opens or closes from inside.',
        },
        { name: 'shown', type: 'void', description: 'Emits after the menu is shown.' },
        { name: 'hidden', type: 'void', description: 'Emits after the menu is hidden.' },
      ],
      methods: [
        {
          name: 'show(focus?)',
          type: 'void',
          description: "Opens the menu. Pass 'first' or 'last' to focus that item.",
        },
        { name: 'hide()', type: 'void', description: 'Closes the menu.' },
        { name: 'toggle()', type: 'void', description: 'Toggles the menu.' },
        { name: 'isOpen', type: 'Signal<boolean>', description: 'Current open state.' },
      ],
    },
    {
      name: 'BsMenuToggle',
      selector: '[bsMenuToggle]',
      inputs: [
        {
          name: 'bsMenuToggle',
          type: 'BsMenu',
          default: 'required',
          description: 'The menu to toggle.',
        },
      ],
    },
    {
      name: 'BsSubmenu',
      selector: '[bsSubmenu]',
      exportAs: 'bsSubmenu',
      inputs: [
        {
          name: 'hover',
          type: 'boolean',
          default: 'true',
          description: 'Opens the submenu on hover as well as on click and keyboard.',
        },
      ],
      methods: [
        { name: 'open()', type: 'void', description: 'Opens the submenu.' },
        { name: 'close()', type: 'void', description: 'Closes the submenu and its submenus.' },
        { name: 'isOpen', type: 'Signal<boolean>', description: 'Current open state.' },
      ],
    },
  ],
};

@Component({
  selector: 'docs-menu-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class MenuPage {
  protected readonly page = PAGE;
}
