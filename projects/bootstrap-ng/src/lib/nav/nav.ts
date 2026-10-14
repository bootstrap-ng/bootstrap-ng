import { booleanAttribute, computed, Directive, input } from '@angular/core';

/**
 * Navigation list with Bootstrap's `.nav` styles. For tabs that switch panels, use
 * `bsTabs` instead.
 *
 * ```html
 * <ul bsNav variant="pills" aria-label="Sections">
 *   <li class="nav-item"><a bsNavLink active href="/">Home</a></li>
 *   <li class="nav-item"><a bsNavLink href="/docs">Docs</a></li>
 * </ul>
 * ```
 */
@Directive({
  selector: '[bsNav]',
  host: {
    '[class]': 'classes()',
    '[class.nav-fill]': 'fill()',
    '[class.nav-justified]': 'justified()',
  },
})
export class BsNav {
  /** Style of the links. */
  readonly variant = input<'tabs' | 'pills' | 'underline' | null>(null);
  /** Stacks the links vertically. */
  readonly vertical = input(false, { transform: booleanAttribute });
  /** Stretches the items to fill the width, each as wide as its content needs. */
  readonly fill = input(false, { transform: booleanAttribute });
  /** Stretches the items to fill the width, all the same width. */
  readonly justified = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const vertical = this.vertical();
    return [
      'nav',
      variant ? `nav-${variant}` : '',
      vertical ? (variant === 'pills' ? 'nav-pills-vertical' : 'flex-column') : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}

/**
 * Link in a `bsNav`. `active` marks the current page with `aria-current="page"`, and
 * `disabled` takes the link out of the tab order.
 */
@Directive({
  selector: 'a[bsNavLink], button[bsNavLink]',
  host: {
    class: 'nav-link',
    '[class.active]': 'active()',
    '[class.disabled]': 'disabled()',
    '[attr.aria-current]': 'active() ? current() : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'disabled() ? "-1" : null',
    '(click)': 'onClick($event)',
  },
})
export class BsNavLink {
  /** Marks the link as the current one. */
  readonly active = input(false, { transform: booleanAttribute });
  /** Disables the link. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Value of `aria-current` when active, such as `'page'` or `'true'`. */
  readonly current = input('page');

  protected onClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
