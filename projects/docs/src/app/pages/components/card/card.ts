import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { CardBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { CardHeaderExample } from './examples/header';
import headerHtml from './examples/header.html' with { loader: 'text' };
import { CardThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Card',
  lead: 'A flexible content container with a header, footer, images and theme variants. Cards are plain markup, so there is no directive.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/card/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Build cards with <code>.card</code>, <code>.card-body</code>, <code>.card-title</code> and <code>.card-text</code>.',
      example: CardBasicExample,
      html: basicHtml,
    },
    {
      id: 'header',
      title: 'Header, footer and list',
      description:
        'Add <code>.card-header</code> and <code>.card-footer</code>, and use a flush <a href="components/list-group">list group</a> inside.',
      example: CardHeaderExample,
      html: headerHtml,
    },
    {
      id: 'themes',
      title: 'Theme variants',
      description: 'Add a <code>.theme-*</code> class to color a card.',
      example: CardThemesExample,
      html: themesHtml,
    },
  ],
  api: [],
};

@Component({
  selector: 'docs-card-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class CardPage {
  protected readonly page = PAGE;
}
