import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { AvatarBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { AvatarThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
import { AvatarSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };
import { AvatarStackExample } from './examples/stack';
import stackHtml from './examples/stack.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Avatar',
  lead: 'Users or entities shown as an image or initials, with sizes, status indicators and stacks.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/avatar/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Set <code>src</code> and <code>alt</code> for an image, or put initials inside the element. If the image fails to load, the initials show instead.',
      example: AvatarBasicExample,
      html: basicHtml,
    },
    {
      id: 'themes',
      title: 'Themes',
      description:
        'Color initials with <code>theme</code>, and add <code>subtle</code> for a lighter background.',
      example: AvatarThemesExample,
      html: themesHtml,
    },
    {
      id: 'sizes',
      title: 'Sizes and status',
      description:
        'Set <code>size</code> to <code>xs</code>, <code>sm</code>, <code>lg</code> or <code>xl</code>. <code>status</code> adds an online, offline, busy or away indicator with an accessible label, which you can change with <code>statusLabel</code>.',
      example: AvatarSizesExample,
      html: sizesHtml,
    },
    {
      id: 'stack',
      title: 'Avatar stack',
      description:
        'Wrap avatars in <code>.avatar-stack</code> to overlap them. The first avatar is on top.',
      example: AvatarStackExample,
      html: stackHtml,
    },
  ],
  api: [
    {
      name: 'BsAvatar',
      selector: 'span[bsAvatar], div[bsAvatar], a[bsAvatar]',
      inputs: [
        {
          name: 'src',
          type: 'string | null',
          default: 'null',
          description: 'Image URL. Without it, the content (initials) shows.',
        },
        {
          name: 'alt',
          type: 'string',
          default: "''",
          description: 'Text alternative of the image.',
        },
        {
          name: 'size',
          type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
          default: "'md'",
          description: 'Size of the avatar.',
        },
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color for initials.',
        },
        {
          name: 'subtle',
          type: 'boolean',
          default: 'false',
          description: 'Uses a subtle background.',
        },
        {
          name: 'status',
          type: "'online' | 'offline' | 'busy' | 'away' | null",
          default: 'null',
          description: 'Presence indicator.',
        },
        {
          name: 'statusLabel',
          type: 'string | null',
          default: 'null',
          description: 'Accessible label of the status. Defaults to its name.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-avatar-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class AvatarPage {
  protected readonly page = PAGE;
}
