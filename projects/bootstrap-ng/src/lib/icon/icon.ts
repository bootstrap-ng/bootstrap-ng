import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  resource,
  untracked,
} from '@angular/core';
import { BsIconRegistry } from './icon-registry';

/**
 * An SVG icon from an icon library, inlined so it takes the text's size and color.
 * Bootstrap Icons is the default library; Font Awesome, Material Symbols, Modus Icons and
 * Phosphor Icons are built in, and you can register your own with `BsIconRegistry` or `provideBsIcons()`.
 * Icons load from jsDelivr by default; self-host them with a library's `baseUrl`, or bundle
 * them as SVG markup in its `icons`, which also renders them on the server.
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

  /** URL of the SVG to show, the markup of an inline icon, or an error. */
  private readonly source = computed<string | { markup: string } | Error | undefined>(() => {
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
    if (!library) {
      return new Error(`Unknown icon library "${libraryName}".`);
    }
    const markup = library.icons?.[name];
    if (markup !== undefined) {
      return { markup };
    }
    return library.resolver
      ? library.resolver(name, this.variant())
      : new Error(`Unknown icon "${name}" in library "${libraryName}".`);
  });

  /** The SVG of an inline icon, parsed at once so it renders on the server too. */
  private readonly inline = computed<SVGSVGElement | Error | undefined>(() => {
    const source = this.source();
    if (source === undefined || typeof source === 'string') {
      return undefined;
    }
    if (source instanceof Error) {
      return source;
    }
    try {
      return this.registry.parse(source.markup);
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  });

  // Icons from URLs load in the browser only: server-rendered pages keep the empty, sized
  // element, so nothing shifts when the icon arrives.
  private readonly svg = resource({
    params: () => {
      const source = this.source();
      return this.isBrowser && typeof source === 'string' ? source : undefined;
    },
    loader: ({ params }) => this.registry.load(params),
  });

  constructor() {
    // A plain effect rather than afterRenderEffect, which doesn't run on the server.
    effect(() => {
      const inline = this.inline();
      const svg =
        inline instanceof Error
          ? null
          : (inline ?? (this.svg.hasValue() ? this.svg.value() : null));
      this.host.textContent = '';
      if (svg) {
        this.host.appendChild(svg);
      }
      const error = inline instanceof Error ? inline : this.svg.error();
      const status = inline ? (error ? 'error' : 'resolved') : this.svg.status();
      untracked(() => {
        if (status === 'resolved') {
          this.loaded.emit();
        } else if (status === 'error') {
          this.loadError.emit(error);
        }
      });
    });
  }
}
