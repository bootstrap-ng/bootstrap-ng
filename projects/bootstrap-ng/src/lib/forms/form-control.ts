import {
  booleanAttribute,
  computed,
  Directive,
  HostAttributeToken,
  inject,
  input,
} from '@angular/core';
import { BsControl } from './control';

/** Style of a text control: a bordered `.form-control`, plain text, or a borderless ghost. */
export type BsFormControlVariant = 'control' | 'plaintext' | 'ghost';
export type BsFormControlSize = 'sm' | 'md' | 'lg';

/**
 * Styles a textual `<input>`, `<textarea>` or `<select>` as a Bootstrap form control.
 * Works with Reactive Forms, `ngModel` and Signal Forms, whose state sets the
 * validation styles. See {@link BsControl} for the shared id, label and validation
 * behavior.
 *
 * ```html
 * <input type="email" bsFormControl [formControl]="email" />
 * <input bsFormControl="plaintext" readonly value="email@example.com" />
 * <select bsFormControl size="sm">…</select>
 * ```
 */
@Directive({
  selector: 'input[bsFormControl], textarea[bsFormControl], select[bsFormControl]',
  exportAs: 'bsFormControl',
  hostDirectives: [{ directive: BsControl, inputs: ['id', 'validation'] }],
  host: { '[class]': 'classes()' },
})
export class BsFormControl {
  private readonly type = inject(new HostAttributeToken('type'), { optional: true });

  /** Style of the control. An empty value means `control`. */
  readonly variant = input<BsFormControlVariant, BsFormControlVariant | ''>('control', {
    alias: 'bsFormControl',
    transform: (value) => value || 'control',
  });
  /** Size of the control. Named `controlSize` because `size` is a native `<select>` attribute. */
  readonly controlSize = input<BsFormControlSize>('md');
  /** Shows a caret, for example on an `<input>` with a `<datalist>`. */
  readonly caret = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const variant = this.variant();
    if (variant === 'ghost') {
      return 'form-ghost';
    }
    if (variant === 'plaintext') {
      return 'form-control-plaintext';
    }
    const size = this.controlSize();
    return [
      'form-control',
      size === 'md' ? '' : `form-control-${size}`,
      this.type === 'color' ? 'form-control-color' : '',
      this.caret() ? 'form-control-caret' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}
