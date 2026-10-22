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
 * file, so icons load one at a time and no icon data ships in your bundle.
 */
export interface BsIconLibrary {
  /** Returns the URL of the SVG file of an icon. `variant` is `null` when none is set. */
  resolver: (name: string, variant: string | null) => string;
}

/** Options of the built-in icon libraries. */
export interface BsIconLibraryOptions {
  /**
   * URL of the folder that holds the icon set's files, without a trailing slash. Defaults to
   * the npm package on jsDelivr. Point it at your own copy to self-host the icons.
   */
  baseUrl?: string;
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
  return { resolver: (name) => `${base}/${name}.svg` };
}

/**
 * [Font Awesome Free](https://fontawesome.com/search?ic=free). Variants: `'solid'` (default),
 * `'regular'` and `'brands'`.
 */
export function fontAwesomeIcons(options: BsIconLibraryOptions = {}): BsIconLibrary {
  const base = options.baseUrl ?? `${JSDELIVR}/@fortawesome/fontawesome-free@7.3.1/svgs`;
  return { resolver: (name, variant) => `${base}/${variant ?? 'solid'}/${name}.svg` };
}

/**
 * [Material Symbols](https://fonts.google.com/icons). Variants: `'outlined'` (default),
 * `'rounded'` and `'sharp'`. Filled icons end in `-fill`, such as `home-fill`.
 */
export function materialSymbols(options: BsIconLibraryOptions = {}): BsIconLibrary {
  const base = options.baseUrl ?? `${JSDELIVR}/@material-symbols/svg-400@0.47.5`;
  return { resolver: (name, variant) => `${base}/${variant ?? 'outlined'}/${name}.svg` };
}

/**
 * [Modus Icons](https://modus-icons.trimble.com/). Variants: `'solid'` (default) and
 * `'outlined'`.
 */
export function modusIcons(options: BsIconLibraryOptions = {}): BsIconLibrary {
  const base = options.baseUrl ?? `${JSDELIVR}/@trimble-oss/modus-icons@1.21.0/dist`;
  return { resolver: (name, variant) => `${base}/modus-${variant ?? 'solid'}/svg/${name}.svg` };
}

/**
 * [Phosphor Icons](https://phosphoricons.com/). Variants: `'regular'` (default), `'thin'`,
 * `'light'`, `'bold'`, `'fill'` and `'duotone'`.
 */
export function phosphorIcons(options: BsIconLibraryOptions = {}): BsIconLibrary {
  const base = options.baseUrl ?? `${JSDELIVR}/@phosphor-icons/core@2.1.1/assets`;
  return {
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
  private readonly libraries = signal<Readonly<Record<string, BsIconLibrary>>>({
    bootstrap: bootstrapIcons(),
    'font-awesome': fontAwesomeIcons(),
    material: materialSymbols(),
    modus: modusIcons(),
    phosphor: phosphorIcons(),
    ...this.config?.libraries,
  });
  private readonly cache = new Map<string, Promise<SVGSVGElement>>();

  /** Name of the library that icons without a `library` use. */
  readonly defaultLibrary = signal(this.config?.defaultLibrary ?? 'bootstrap');

  /** Adds an icon library, or replaces the one with the same name. */
  register(name: string, library: BsIconLibrary): void {
    this.libraries.update((libraries) => ({ ...libraries, [name]: library }));
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
}

async function fetchSvg(url: string): Promise<SVGSVGElement> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Icon ${url} failed to load (${String(response.status)}).`);
  }
  const doc = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  const svg = doc.documentElement;
  if (!(svg instanceof SVGSVGElement)) {
    throw new Error(`Icon ${url} is not an SVG.`);
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
  return svg;
}
