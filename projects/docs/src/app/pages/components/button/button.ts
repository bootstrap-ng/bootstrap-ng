import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { ButtonVariantsExample } from './examples/variants';
import variantsHtml from './examples/variants.html' with { loader: 'text' };
import { ButtonThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import themesTs from './examples/themes.ts' with { loader: 'text' };
import { ButtonSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };
import { ButtonStyledExample } from './examples/styled';
import styledHtml from './examples/styled.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Button',
  lead: 'Bootstrap button styles for <button>, <a> and <input> elements.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/button/',
  sections: [
    {
      id: 'variants',
      title: 'Variants',
      description:
        'Set the variant as the value of <code>bsButton</code>. An empty value means <code>solid</code>.',
      example: ButtonVariantsExample,
      html: variantsHtml,
    },
    {
      id: 'themes',
      title: 'Themes',
      description: 'Combine any variant with a <code>theme</code>.',
      example: ButtonThemesExample,
      html: themesHtml,
      ts: themesTs,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: 'Use <code>size</code> for extra small, small and large buttons.',
      example: ButtonSizesExample,
      html: sizesHtml,
    },
    {
      id: 'styled',
      title: 'Styled, icon and disabled buttons',
      description:
        '<code>styled</code> adds a gradient and shadow. <code>icon</code> makes a square button for a single icon; give it an <code>aria-label</code>. Use the native <code>disabled</code> attribute on buttons.',
      example: ButtonStyledExample,
      html: styledHtml,
    },
  ],
  api: [
    {
      name: 'BsButton',
      selector: 'button[bsButton], a[bsButton], input[bsButton]',
      inputs: [
        {
          name: 'bsButton',
          type: "'solid' | 'outline' | 'subtle' | 'text' | 'link' | 'base'",
          default: "'solid'",
          description: 'Visual style.',
        },
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color.',
        },
        {
          name: 'size',
          type: "'xs' | 'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Button size.',
        },
        {
          name: 'icon',
          type: 'boolean',
          default: 'false',
          description: 'Square button for a single icon.',
        },
        {
          name: 'styled',
          type: 'boolean',
          default: 'false',
          description: 'Adds a gradient and shadow.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-button-page',
  imports: [DocsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<docs-page [page]="page" />',
})
export default class ButtonPage {
  protected readonly page = PAGE;
}
