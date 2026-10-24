import { DOCUMENT } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  Service,
  signal,
} from '@angular/core';

/**
 * A set of SVG icons. The resolver turns an icon's name and variant into the URL of its SVG
 * file, so icons load one at a time and no icon data ships in your bundle. Icons in `icons`
 * are bundled instead: they show at once, need no network and render on the server.
 */
export interface BsIconLibrary {
  /**
   * Returns the URL of the SVG file of an icon. `variant` is `null` when none is set. Leave it
   * out when every icon of the library is in `icons`.
   */
  resolver?: (name: string, variant: string | null) => string;
  /**
   * SVG markup of icons, by name, used before the resolver whatever the variant. Give each
   * variant its own name, such as `heart-fill`.
   */
  icons?: Readonly<Record<string, string>>;
}

/** Options of the built-in icon libraries. */
export interface BsIconLibraryOptions {
  /**
   * URL of the folder that holds the icon set's files, without a trailing slash. Defaults to
   * the npm package on jsDelivr. Point it at your own copy to self-host the icons.
   */
  baseUrl?: string;
  /** SVG markup of icons, by name, to bundle instead of loading. See `BsIconLibrary.icons`. */
  icons?: Readonly<Record<string, string>>;
}

/** Configuration passed to `provideBsIcons()`. */
export interface BsIconConfig {
  /** Name of the library that icons without a `library` use. Defaults to `'bootstrap'`. */
  defaultLibrary?: string;
  /** Libraries to add, or built-in ones to replace, by name. */
  libraries?: Record<string, BsIconLibrary>;
}

const JSDELIVR = 'https://cdn.jsdelivr.net/npm';

/**
 * [Bootstrap Icons](https://icons.getbootstrap.com/). Filled icons are separate names, such
 * as `heart-fill`.
 */
export function bootstrapIcons(options: BsIconLibraryOptions = {}): BsIconLibrary {
  const base = options.baseUrl ?? `${JSDELIVR}/bootstrap-icons@1.13.1/icons`;
  return {
    ...(options.icons && { icons: options.icons }),
    resolver: (name) => `${base}/${name}.svg`,
  };
}

/**
 * [Font Awesome Free](https://fontawesome.com/search?ic=free). Variants: `'solid'` (default),
 * `'regular'` and `'brands'`.
 */
export function fontAwesomeIcons(options: BsIconLibraryOptions = {}): BsIconLibrary {
  const base = options.baseUrl ?? `${JSDELIVR}/@fortawesome/fontawesome-free@7.3.1/svgs`;
  return {
    ...(options.icons && { icons: options.icons }),
    resolver: (name, variant) => `${base}/${variant ?? 'solid'}/${name}.svg`,
  };
}

/**
 * [Material Symbols](https://fonts.google.com/icons). Variants: `'outlined'` (default),
 * `'rounded'` and `'sharp'`. Filled icons end in `-fill`, such as `home-fill`.
 */
export function materialSymbols(options: BsIconLibraryOptions = {}): BsIconLibrary {
  const base = options.baseUrl ?? `${JSDELIVR}/@material-symbols/svg-400@0.47.5`;
  return {
    ...(options.icons && { icons: options.icons }),
    resolver: (name, variant) => `${base}/${variant ?? 'outlined'}/${name}.svg`,
  };
}

/**
 * [Modus Icons](https://modus-icons.trimble.com/). Variants: `'solid'` (default) and
 * `'outlined'`.
 */
export function modusIcons(options: BsIconLibraryOptions = {}): BsIconLibrary {
  const base = options.baseUrl ?? `${JSDELIVR}/@trimble-oss/modus-icons@1.21.0/dist`;
  return {
    ...(options.icons && { icons: options.icons }),
    resolver: (name, variant) => `${base}/modus-${variant ?? 'solid'}/svg/${name}.svg`,
  };
}

/**
 * [Phosphor Icons](https://phosphoricons.com/). Variants: `'regular'` (default), `'thin'`,
 * `'light'`, `'bold'`, `'fill'` and `'duotone'`.
 */
export function phosphorIcons(options: BsIconLibraryOptions = {}): BsIconLibrary {
  const base = options.baseUrl ?? `${JSDELIVR}/@phosphor-icons/core@2.1.1/assets`;
  return {
    ...(options.icons && { icons: options.icons }),
    resolver: (name, variant) =>
      !variant || variant === 'regular'
        ? `${base}/regular/${name}.svg`
        : `${base}/${variant}/${name}-${variant}.svg`,
  };
}

const BS_ICON_CONFIG = new InjectionToken<BsIconConfig>('BS_ICON_CONFIG');

/**
 * Sets the default icon library and adds icon libraries for the whole app.
 *
 * ```ts
 * providers: [provideBsIcons({ defaultLibrary: 'font-awesome' })]
 * ```
 */
export function provideBsIcons(config: BsIconConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: BS_ICON_CONFIG, useValue: config }]);
}

/**
 * The icon libraries that `bs-icon` loads from, and a cache of the icons it has loaded.
 * `bootstrap` (the default), `font-awesome`, `material`, `modus` and `phosphor` are built in.
 */
@Service()
export class BsIconRegistry {
  private readonly config = inject(BS_ICON_CONFIG, { optional: true });
  private readonly document = inject(DOCUMENT);
  private readonly libraries = signal<Readonly<Record<string, BsIconLibrary>>>({
    bootstrap: bootstrapIcons(),
    'font-awesome': fontAwesomeIcons(),
    material: materialSymbols(),
    modus: modusIcons(),
    phosphor: phosphorIcons(),
    ...this.config?.libraries,
  });
  private readonly cache = new Map<string, Promise<SVGSVGElement>>();
  private readonly parsed = new Map<string, SVGSVGElement>();

  /** Name of the library that icons without a `library` use. */
  readonly defaultLibrary = signal(this.config?.defaultLibrary ?? 'bootstrap');

  /** Adds an icon library, or replaces the one with the same name. */
  register(name: string, library: BsIconLibrary): void {
    this.libraries.update((libraries) => ({ ...libraries, [name]: library }));
  }

  /**
   * Adds icons, as SVG markup by name, to a library, which is created when it doesn't exist.
   * These icons are bundled: they show at once, need no network and render on the server.
   */
  addIcons(library: string, icons: Readonly<Record<string, string>>): void {
    this.libraries.update((libraries) => ({
      ...libraries,
      [library]: { ...libraries[library], icons: { ...libraries[library]?.icons, ...icons } },
    }));
  }

  /** Returns the library registered under `name`, if any. */
  get(name: string): BsIconLibrary | undefined {
    return this.libraries()[name];
  }

  /**
   * Loads the SVG at `url` and returns a copy of it. Each URL is fetched once; scripts and
   * event handler attributes are removed.
   */
  async load(url: string): Promise<SVGSVGElement> {
    let svg = this.cache.get(url);
    if (!svg) {
      svg = fetchSvg(url);
      this.cache.set(url, svg);
      // Forget failures, so a later icon can try again.
      svg.catch(() => this.cache.delete(url));
    }
    return (await svg).cloneNode(true) as SVGSVGElement;
  }

  /**
   * Parses SVG markup, such as an icon from a library's `icons`, and returns a copy of it,
   * cleaned like a loaded SVG. Works on the server too. Throws when the markup isn't an SVG.
   */
  parse(markup: string): SVGSVGElement {
    let svg = this.parsed.get(markup);
    if (!svg) {
      // A template's content is inert: nothing in it loads or runs while it is cleaned.
      const template = this.document.createElement('template');
      template.innerHTML = markup;
      const element = Array.from(template.content.childNodes).find(
        (node): node is Element => node.nodeType === 1,
      );
      svg = clean(element, 'Inline icon');
      this.parsed.set(markup, svg);
    }
    return svg.cloneNode(true) as SVGSVGElement;
  }
}

async function fetchSvg(url: string): Promise<SVGSVGElement> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Icon ${url} failed to load (${String(response.status)}).`);
  }
  const doc = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  return clean(doc.documentElement, `Icon ${url}`);
}

/** Removes scripts and event handlers from an SVG, and sizes and colors it like text. */
function clean(svg: Element | undefined, description: string): SVGSVGElement {
  // Checked by name, since the server has no SVGSVGElement class.
  if (svg?.localName !== 'svg' || svg.namespaceURI !== 'http://www.w3.org/2000/svg') {
    throw new Error(`${description} is not an SVG.`);
  }
  for (const element of Array.from(svg.querySelectorAll('script, foreignObject'))) {
    element.remove();
  }
  for (const element of [svg, ...Array.from(svg.querySelectorAll('*'))]) {
    for (const { name, value } of Array.from(element.attributes)) {
      if (/^on/i.test(name) || (/href$/i.test(name) && /^\s*javascript:/i.test(value))) {
        element.removeAttribute(name);
      }
    }
  }
  // Size the icon by its container, and color it with the text color unless it sets its own.
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  if (!svg.hasAttribute('fill')) {
    svg.setAttribute('fill', 'currentColor');
  }
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  return svg as SVGSVGElement;
}
