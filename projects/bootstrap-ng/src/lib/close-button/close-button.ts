import { Directive, input } from '@angular/core';

/**
 * Generic close button for dialogs, alerts and more.
 *
 * ```html
 * <button bsCloseButton (click)="close()"></button>
 * ```
 */
@Directive({
  selector: 'button[bsCloseButton]',
  host: {
    class: 'btn-close',
    type: 'button',
    '[attr.aria-label]': 'label()',
  },
})
export class BsCloseButton {
  /** Accessible label of the button. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- mirrors the native aria-label attribute
  readonly label = input('Close', { alias: 'aria-label' });
}
