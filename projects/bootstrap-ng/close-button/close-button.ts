import { Directive, inject, input, Provider } from '@angular/core';
import { configToken, provideConfig } from 'bootstrap-ng/util';

/** Defaults for the inputs of close buttons. Inputs set on a component win over them. */
export interface BsCloseButtonConfig {
  label: string;
}

/** The defaults set with `provideBsCloseButtonConfig()`. */
export const BS_CLOSE_BUTTON_CONFIG = configToken<BsCloseButtonConfig>('BS_CLOSE_BUTTON_CONFIG');

/**
 * Sets defaults for the inputs of close buttons, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsCloseButtonConfig({ label: 'Fermer' })]
 * ```
 */
export function provideBsCloseButtonConfig(config: Partial<BsCloseButtonConfig>): Provider {
  return provideConfig(BS_CLOSE_BUTTON_CONFIG, config);
}

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
  private readonly config = inject(BS_CLOSE_BUTTON_CONFIG);
  /** Accessible label of the button. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- mirrors the native aria-label attribute
  readonly label = input(this.config.label ?? 'Close', { alias: 'aria-label' });
}
