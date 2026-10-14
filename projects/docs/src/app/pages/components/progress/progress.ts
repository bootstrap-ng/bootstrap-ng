import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { ProgressBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { ProgressLabelsExample } from './examples/labels';
import labelsHtml from './examples/labels.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import labelsTs from './examples/labels.ts' with { loader: 'text' };
import { ProgressThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
import { ProgressStackedExample } from './examples/stacked';
import stackedHtml from './examples/stacked.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Progress',
  lead: 'Progress bars with labels, themes, stripes and stacking.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/progress/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Set <code>value</code>, and optionally <code>min</code> and <code>max</code>. The component sets the ARIA attributes. Always give it an accessible name with <code>aria-label</code>.',
      example: ProgressBasicExample,
      html: basicHtml,
    },
    {
      id: 'labels',
      title: 'Labels',
      description:
        'Content inside the component is the bar’s label. Use <code>valueText</code> for a better screen reader value.',
      example: ProgressLabelsExample,
      html: labelsHtml,
      ts: labelsTs,
    },
    {
      id: 'themes',
      title: 'Themes and stripes',
      description: 'Use <code>theme</code>, <code>striped</code> and <code>animated</code>.',
      example: ProgressThemesExample,
      html: themesHtml,
    },
    {
      id: 'stacked',
      title: 'Stacked',
      description: 'Put several bars in a <code>bsProgressStacked</code> container.',
      example: ProgressStackedExample,
      html: stackedHtml,
    },
  ],
  api: [
    {
      name: 'BsProgress',
      selector: 'bs-progress',
      inputs: [
        {
          name: 'value',
          type: 'number',
          default: '0',
          description: 'Current value.',
        },
        {
          name: 'min',
          type: 'number',
          default: '0',
          description: 'Minimum value.',
        },
        {
          name: 'max',
          type: 'number',
          default: '100',
          description: 'Maximum value.',
        },
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the bar.',
        },
        {
          name: 'striped',
          type: 'boolean',
          default: 'false',
          description: 'Adds stripes.',
        },
        {
          name: 'animated',
          type: 'boolean',
          default: 'false',
          description: 'Animates the stripes.',
        },
        {
          name: 'valueText',
          type: 'string | null',
          default: 'null',
          description: 'Human-readable value for screen readers.',
        },
      ],
    },
    {
      name: 'BsProgressStacked',
      selector: '[bsProgressStacked]',
      inputs: [],
    },
  ],
};

@Component({
  selector: 'docs-progress-page',
  imports: [DocsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<docs-page [page]="page" />',
})
export default class ProgressPage {
  protected readonly page = PAGE;
}
