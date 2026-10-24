import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BsTheme, themeClass } from 'bootstrap-ng/util';

export type BsButtonVariant = 'solid' | 'outline' | 'subtle' | 'text' | 'link' | 'base';
export type BsButtonSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Applies Bootstrap button styles to a `<button>`, `<a>` or `<input>`.
 *
 * ```html
 * <button type="button" bsButton theme="primary">Save</button>
 * <button type="button" bsButton="outline" theme="secondary" size="sm">Cancel</button>
 * ```
 */
@Directive({
  selector: 'button[bsButton], a[bsButton], input[bsButton]',
  host: {
    '[class]': 'classes()',
    '[class.btn-icon]': 'icon()',
    '[class.btn-styled]': 'styled()',
  },
})
export class BsButton {
  /** Visual style of the button. An empty value means `solid`. */
  readonly variant = input<BsButtonVariant, BsButtonVariant | ''>('solid', {
    alias: 'bsButton',
    transform: (value) => value || 'solid',
  });
  /** Theme color of the button. */
  readonly theme = input<BsTheme | null>(null);
  /** Size of the button. */
  readonly size = input<BsButtonSize>('md');
  /** Makes a square button for a single icon. Give it an `aria-label`. */
  readonly icon = input(false, { transform: booleanAttribute });
  /** Adds a gradient and shadow to solid buttons. */
  readonly styled = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const size = this.size();
    return [
      variant === 'base' ? 'btn' : variant === 'link' ? 'btn btn-link' : `btn-${variant}`,
      themeClass(this.theme()),
      size === 'md' ? '' : `btn-${size}`,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
