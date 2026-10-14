import { computed, Directive, input, numberAttribute } from '@angular/core';

/**
 * Loading placeholder (skeleton) block. Wrap placeholders in an element with
 * `.placeholder-glow`, `.placeholder-wave` or `.placeholder-pulse` to animate them, and
 * hide the loading content from assistive technologies with `aria-hidden="true"`.
 *
 * ```html
 * <p class="placeholder-glow" aria-hidden="true">
 *   <span bsPlaceholder [width]="6"></span>
 * </p>
 * ```
 */
@Directive({
  selector: '[bsPlaceholder]',
  host: {
    '[class]': 'classes()',
  },
})
export class BsPlaceholder {
  /** Width in grid columns, from 1 to 12. */
  readonly width = input(12, { transform: numberAttribute });
  /** Height of the placeholder. */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg'>('md');

  protected readonly classes = computed(() =>
    [
      'placeholder',
      `col-${Math.min(Math.max(Math.round(this.width()), 1), 12)}`,
      this.size() === 'md' ? '' : `placeholder-${this.size()}`,
    ]
      .filter(Boolean)
      .join(' '),
  );
}
