import { booleanAttribute, computed, Directive, input, signal, untracked } from '@angular/core';
import type { BsControl } from './control';

/**
 * Floating label wrapper. Put the `<label>` first, then the control, so screen readers
 * announce the label before the value. Text controls need a non-empty `placeholder`,
 * because Bootstrap's CSS floats the label with `:placeholder-shown`; it shows once the
 * control is focused. Selects and date and time inputs always float the label.
 *
 * A `bsLabel` inside gets `for` set to the control's id, and the wrapper mirrors the
 * control's `.is-valid` / `.is-invalid` state for input groups.
 *
 * ```html
 * <div bsFormFloating>
 *   <label bsLabel>Email address</label>
 *   <input type="email" bsFormControl placeholder="name@example.com" />
 * </div>
 * ```
 */
@Directive({
  selector: '[bsFormFloating]',
  exportAs: 'bsFormFloating',
  host: {
    class: 'form-floating',
    '[class.form-floating-always]': 'always()',
    '[class.is-valid]': "state() === 'valid'",
    '[class.is-invalid]': "state() === 'invalid'",
  },
})
export class BsFormFloating {
  private readonly control = signal<BsControl | null>(null);

  /** Keeps the label floated and the placeholder visible. */
  readonly always = input(false, { transform: booleanAttribute });

  /** Id of the control inside the wrapper. */
  readonly controlId = computed(() => this.control()?.id() ?? null);
  protected readonly state = computed(() => this.control()?.state() ?? null);

  /** Registers the wrapper's control. Returns a function that removes it. */
  registerControl(control: BsControl): () => void {
    untracked(() => this.control.set(control));
    return () => {
      if (this.control() === control) {
        this.control.set(null);
      }
    };
  }
}
