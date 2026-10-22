import { isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  resource,
} from '@angular/core';
import { BsIconRegistry } from './icon-registry';

/**
 * An SVG icon from an icon library, inlined so it takes the text's size and color.
 * Bootstrap Icons is the default library; Font Awesome, Material Symbols, Modus Icons and
 * Phosphor Icons are built in, and you can register your own with `BsIconRegistry` or `provideBsIcons()`.
 *
 * Icons are decorative (hidden from screen readers) unless you give them a `label`.
 *
 * ```html
 * <bs-icon name="heart" />
 * <bs-icon library="font-awesome" variant="regular" name="bell" label="Notifications" />
 * ```
 */
@Component({
  selector: 'bs-icon',
  exportAs: 'bsIcon',
  host: {
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label()',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  template: '',
  styles: `
    :host {
      display: inline-flex;
      inline-size: 1em;
      block-size: 1em;
      vertical-align: -0.125em;
    }
  `,
})
export class BsIcon {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly registry = inject(BsIconRegistry);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Name of the icon in its library, such as `heart`. */
  readonly name = input<string | null>(null);
  /** Library the icon comes from. Defaults to the registry's default library. */
  readonly library = input<string | null>(null);
  /** Style of the icon, such as `'regular'` in Font Awesome. Each library has its own. */
  readonly variant = input<string | null>(null);
  /** URL of an SVG file to show instead of a named icon. */
  readonly src = input<string | null>(null);
  /** Accessible name. Without it the icon is decorative and hidden from screen readers. */
  readonly label = input<string | null>(null);

  /** Emits when the icon has loaded and shows. */
  readonly loaded = output();
  /** Emits when the icon fails to load, such as for an unknown name or library. */
  readonly loadError = output<unknown>();

  /** URL of the SVG to show, or an error for an unknown library. */
  private readonly url = computed<string | Error | undefined>(() => {
    const src = this.src();
    if (src) {
      return src;
    }
    const name = this.name();
    if (!name) {
      return undefined;
    }
    const libraryName = this.library() ?? this.registry.defaultLibrary();
    const library = this.registry.get(libraryName);
    return library
      ? library.resolver(name, this.variant())
      : new Error(`Unknown icon library "${libraryName}".`);
  });

  // Icons load in the browser only: server-rendered pages keep the empty, sized element,
  // so nothing shifts when the icon arrives.
  private readonly svg = resource({
    params: () => (this.isBrowser ? this.url() : undefined),
    loader: ({ params }) =>
      params instanceof Error ? Promise.reject(params) : this.registry.load(params),
  });

  constructor() {
    afterRenderEffect({
      write: () => {
        const svg = this.svg.hasValue() ? this.svg.value() : null;
        this.host.replaceChildren(...(svg ? [svg] : []));
        const status = this.svg.status();
        if (status === 'resolved') {
          this.loaded.emit();
        } else if (status === 'error') {
          this.loadError.emit(this.svg.error());
        }
      },
    });
  }
}
