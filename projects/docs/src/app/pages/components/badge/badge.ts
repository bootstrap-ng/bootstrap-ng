import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { BadgeVariantsExample } from './examples/variants';
import variantsHtml from './examples/variants.html' with { loader: 'text' };
import { BadgeThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import themesTs from './examples/themes.ts' with { loader: 'text' };
import { BadgeButtonExample } from './examples/button';
import buttonHtml from './examples/button.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Badge',
  lead: 'Small components for counts and labels.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/badge/',
  sections: [
    {
      id: 'variants',
      title: 'Variants',
      description:
        'Badges come in solid (default), subtle and outline variants. Add <code>pill</code> for rounded ends.',
      example: BadgeVariantsExample,
      html: variantsHtml,
    },
    {
      id: 'themes',
      title: 'Themes',
      description: 'Every variant works with every theme color.',
      example: BadgeThemesExample,
      html: themesHtml,
      ts: themesTs,
    },
    {
      id: 'button',
      title: 'In buttons',
      description: 'Badges scale with their parent, so they fit in buttons and headings.',
      example: BadgeButtonExample,
      html: buttonHtml,
    },
  ],
  api: [
    {
      name: 'BsBadge',
      selector: '[bsBadge]',
      inputs: [
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the badge.',
        },
        {
          name: 'variant',
          type: "'solid' | 'subtle' | 'outline'",
          default: "'solid'",
          description: 'Visual style.',
        },
        {
          name: 'pill',
          type: 'boolean',
          default: 'false',
          description: 'Gives the badge fully rounded ends.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-badge-page',
  imports: [DocsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<docs-page [page]="page" />',
})
export default class BadgePage {
  protected readonly page = PAGE;
}
