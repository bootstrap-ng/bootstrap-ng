import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { LayoutStackedExample } from './examples/stacked';
import stackedHtml from './examples/stacked.html' with { loader: 'text' };
import { LayoutGridExample } from './examples/grid';
import gridHtml from './examples/grid.html' with { loader: 'text' };
import { LayoutHorizontalExample } from './examples/horizontal';
import horizontalHtml from './examples/horizontal.html' with { loader: 'text' };
import { LayoutColumnSizingExample } from './examples/column-sizing';
import column_sizingHtml from './examples/column-sizing.html' with { loader: 'text' };
import { LayoutAutoSizingExample } from './examples/auto-sizing';
import auto_sizingHtml from './examples/auto-sizing.html' with { loader: 'text' };
import { LayoutInlineExample } from './examples/inline';
import inlineHtml from './examples/inline.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Layout',
  lead: 'Stacked, grid, horizontal and inline form layouts.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/layout/',
  sections: [
    {
      id: 'forms',
      title: 'Stacked',
      description:
        'Form controls are full width, so fields stack. Space them with a <code>.vstack</code> and a gap, or with margin utilities. Always give <code>&lt;button&gt;</code>s a <code>type</code>, because buttons in a form default to <code>submit</code>.',
      example: LayoutStackedExample,
      html: stackedHtml,
    },
    {
      id: 'form-grid',
      title: 'Form grid',
      description:
        'Build multi-column forms with the grid. Gutter classes such as <code>.g-3</code> space rows and columns.',
      example: LayoutGridExample,
      html: gridHtml,
    },
    {
      id: 'horizontal-form',
      title: 'Horizontal form',
      description:
        'Use <code>.row</code> and column classes such as <code>.sm:col-2</code> to put labels next to controls. Add <code>.col-form-label</code> to labels to center them vertically with their controls, and <code>.col-form-label-sm</code> or <code>.col-form-label-lg</code> to match a control’s size.',
      example: LayoutHorizontalExample,
      html: horizontalHtml,
    },
    {
      id: 'column-sizing',
      title: 'Column sizing',
      description:
        'Give some columns a size, such as <code>.sm:col-7</code>, and the remaining <code>.col</code>s share the rest.',
      example: LayoutColumnSizingExample,
      html: column_sizingHtml,
    },
    {
      id: 'auto-sizing',
      title: 'Auto-sizing',
      description:
        'Use <code>.col-auto</code> so columns only take the space they need. Hide labels visually with <code>.visually-hidden</code> when the layout has no room, so screen readers still announce them.',
      example: LayoutAutoSizingExample,
      html: auto_sizingHtml,
    },
    {
      id: 'inline-forms',
      title: 'Inline forms',
      description:
        'Use <code>.lg:row-cols-auto</code> for a form that is one row on large screens and stacks on small ones.',
      example: LayoutInlineExample,
      html: inlineHtml,
    },
  ],
  api: [],
};

@Component({
  selector: 'docs-layout-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class LayoutPage {
  protected readonly page = PAGE;
}
