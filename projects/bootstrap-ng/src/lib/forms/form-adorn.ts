import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BsFormControlSize } from './form-control';

/**
 * A `<label>` that looks like a form control and holds a `bsFormControl="ghost"` input
 * with icons or text next to it. Clicking anywhere on it focuses the input, because it
 * is the input's label. Don't put buttons or other interactive content inside.
 *
 * ```html
 * <label bsFormAdorn>
 *   <span bsFormAdornText>$</span>
 *   <input bsFormControl="ghost" placeholder="0.00" />
 * </label>
 * ```
 */
@Directive({
  selector: 'label[bsFormAdorn]',
  exportAs: 'bsFormAdorn',
  host: { '[class]': 'classes()' },
})
export class BsFormAdorn {
  /** Shows the adornments after the input, without changing the DOM order. */
  readonly end = input(false, { transform: booleanAttribute });
  /** Size of the wrapper. */
  readonly size = input<BsFormControlSize>('md');

  protected readonly classes = computed(() => {
    const size = this.size();
    return [
      'form-control form-adorn',
      size === 'md' ? '' : `form-control-${size}`,
      this.end() ? 'form-adorn-end' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}

/**
 * An icon in a `bsFormAdorn`. Hidden from screen readers, because the wrapping label
 * would otherwise add it to the input's name.
 */
@Directive({
  selector: '[bsFormAdornIcon]',
  host: { class: 'form-adorn-icon', 'aria-hidden': 'true' },
})
export class BsFormAdornIcon {}

/**
 * Text such as a currency symbol or unit in a `bsFormAdorn`. Hidden from screen
 * readers; put anything meaningful in the visible label or a `bsFormText`.
 */
@Directive({
  selector: '[bsFormAdornText]',
  host: { class: 'form-adorn-text', 'aria-hidden': 'true' },
})
export class BsFormAdornText {}
