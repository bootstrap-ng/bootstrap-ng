import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { TogglerBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { TogglerTargetExample } from './examples/target';
import targetHtml from './examples/target.html' with { loader: 'text' };
import { TogglerAttributeExample } from './examples/attribute';
import attributeHtml from './examples/attribute.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Toggler',
  lead: 'Toggles a class or attribute on click, for small interactions that would otherwise need a one-off handler.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/toggler/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        '<code>bsToggler</code> takes the class to toggle. On an element that is not a button, it adds <code>role="button"</code>, keyboard support and <code>aria-pressed</code>.',
      example: TogglerBasicExample,
      html: basicHtml,
    },
    {
      id: 'target',
      title: 'Targets',
      description: 'Pass one element or an array to <code>target</code> to toggle them instead.',
      example: TogglerTargetExample,
      html: targetHtml,
    },
    {
      id: 'attribute',
      title: 'Attributes',
      description:
        'Set <code>attribute</code> to toggle an attribute to the given value, for example <code>disabled</code> on a <code>fieldset</code>.',
      example: TogglerAttributeExample,
      html: attributeHtml,
    },
  ],
  api: [
    {
      name: 'BsToggler',
      selector: '[bsToggler]',
      exportAs: 'bsToggler',
      inputs: [
        {
          name: 'bsToggler',
          type: 'string',
          default: 'required',
          description: 'Class name, or attribute value, to toggle.',
        },
        {
          name: 'attribute',
          type: 'string',
          default: "'class'",
          description: 'Attribute to toggle.',
        },
        {
          name: 'target',
          type: 'HTMLElement | HTMLElement[] | null',
          default: 'null',
          description: 'Elements to toggle instead of this one.',
        },
      ],
      outputs: [
        {
          name: 'toggled',
          type: 'boolean',
          description: 'Emits the new state.',
        },
      ],
      methods: [
        {
          name: 'toggle()',
          type: 'void',
          description: 'Toggles.',
        },
        {
          name: 'isOn',
          type: 'Signal<boolean>',
          description: 'Whether the class or attribute is set.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-toggler-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class TogglerPage {
  protected readonly page = PAGE;
}
