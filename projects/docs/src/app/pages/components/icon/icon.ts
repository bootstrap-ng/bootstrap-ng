import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { IconBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { IconStylingExample } from './examples/styling';
import stylingHtml from './examples/styling.html' with { loader: 'text' };
import { IconLibrariesExample } from './examples/libraries';
import librariesHtml from './examples/libraries.html' with { loader: 'text' };
import { IconButtonsExample } from './examples/buttons';
import buttonsHtml from './examples/buttons.html' with { loader: 'text' };
import { IconCustomExample } from './examples/custom';
import customHtml from './examples/custom.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import customTs from './examples/custom.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Icon',
  lead: 'SVG icons from Bootstrap Icons, Modus Icons, Font Awesome, Material Symbols or your own icon set, loaded one at a time and sized and colored like text.',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Set <code>name</code> to the name of a <a href="https://icons.getbootstrap.com/">Bootstrap Icons</a> icon. Each icon’s SVG is fetched once, cached and inlined, so no icon set ships in your bundle. Icons are decorative and hidden from screen readers; give an icon that carries meaning on its own a <code>label</code>, which makes it a <code>role="img"</code> with that name.',
      example: IconBasicExample,
      html: basicHtml,
    },
    {
      id: 'styling',
      title: 'Size and color',
      description:
        'Icons are <code>1em</code> square and use the current text color, so font size and color utilities such as <code>.fs-3xl</code> and <code>.fg-success</code> style them.',
      example: IconStylingExample,
      html: stylingHtml,
    },
    {
      id: 'libraries',
      title: 'Icon libraries',
      description:
        'Set <code>library</code> to <code>modus</code>, <code>font-awesome</code> or <code>material</code> for the other built-in sets, and <code>variant</code> for a style within one: Modus Icons has <code>solid</code> and <code>outlined</code>, Font Awesome Free has <code>solid</code>, <code>regular</code> and <code>brands</code>, and Material Symbols has <code>outlined</code>, <code>rounded</code> and <code>sharp</code>, with filled icons named <code>…-fill</code>. Use each set’s own icon names, such as <code>cloud_upload</code> in Material Symbols.',
      example: IconLibrariesExample,
      html: librariesHtml,
    },
    {
      id: 'buttons',
      title: 'In buttons',
      description:
        'Buttons space an icon from their text. A button with only an icon needs an <code>aria-label</code>.',
      example: IconButtonsExample,
      html: buttonsHtml,
    },
    {
      id: 'custom',
      title: 'Custom libraries and files',
      description:
        'Register any icon set with a resolver that turns a name and variant into an SVG URL, either with <code>BsIconRegistry.register()</code> or with <code>provideBsIcons()</code> in your app config (see <a href="getting-started/services#icon-registry">Services and helpers</a>), and set <code>src</code> to show a single SVG file.',
      example: IconCustomExample,
      html: customHtml,
      ts: customTs,
    },
  ],
  api: [
    {
      name: 'BsIcon',
      selector: 'bs-icon',
      exportAs: 'bsIcon',
      inputs: [
        {
          name: 'name',
          type: 'string | null',
          default: 'null',
          description: 'Name of the icon in its library.',
        },
        {
          name: 'library',
          type: 'string | null',
          default: 'null',
          description: "Icon library. Defaults to the registry's default library, 'bootstrap'.",
        },
        {
          name: 'variant',
          type: 'string | null',
          default: 'null',
          description: "Style of the icon within its library, such as 'regular' in Font Awesome.",
        },
        {
          name: 'src',
          type: 'string | null',
          default: 'null',
          description: 'URL of an SVG file to show instead of a named icon.',
        },
        {
          name: 'label',
          type: 'string | null',
          default: 'null',
          description: 'Accessible name. Without it the icon is hidden from screen readers.',
        },
      ],
      outputs: [
        { name: 'loaded', type: 'void', description: 'Emits when the icon has loaded.' },
        {
          name: 'loadError',
          type: 'unknown',
          description: 'Emits the error when the icon fails to load or its library is unknown.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-icon-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class IconPage {
  protected readonly page = PAGE;
}
