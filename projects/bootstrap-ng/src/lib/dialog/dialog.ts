import { booleanAttribute, Directive, inject, input, Provider } from '@angular/core';
import { configToken, provideConfig } from '../util/config';
import { BsDialogBase } from './dialog-base';

export { BsDialogClose } from './dialog-base';

/**
 * Defaults for the inputs of dialogs, including those opened with `BsDialogService`.
 * Inputs and options set on a dialog win over them.
 */
export interface BsDialogConfig {
  /**
   * `true` closes on a backdrop click. `'static'` keeps it open and plays a short
   * bounce. `false` ignores backdrop clicks.
   */
  backdrop: boolean | 'static';
  /** Closes on Escape. */
  keyboard: boolean;
  /** Animates opening and closing. */
  animation: boolean;
}

/** The defaults set with `provideBsDialogConfig()`. */
export const BS_DIALOG_CONFIG = configToken<BsDialogConfig>('BS_DIALOG_CONFIG');

/**
 * Sets defaults for the inputs of dialogs, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsDialogConfig({ backdrop: 'static' })]
 * ```
 */
export function provideBsDialogConfig(config: Partial<BsDialogConfig>): Provider {
  return provideConfig(BS_DIALOG_CONFIG, config);
}

/**
 * Dialog built on the native `<dialog>` element. Modal dialogs render in the top
 * layer with a backdrop, trap focus, and close on Escape.
 *
 * ```html
 * <button bsButton (click)="dialog.show()">Open</button>
 * <dialog bsDialog #dialog="bsDialog" aria-labelledby="dialog-title">
 *   <div class="dialog-header">
 *     <h2 class="dialog-title" id="dialog-title">Title</h2>
 *     <button bsCloseButton bsDialogClose></button>
 *   </div>
 *   <div class="dialog-body">…</div>
 * </dialog>
 * ```
 */
@Directive({
  selector: 'dialog[bsDialog]',
  exportAs: 'bsDialog',
  providers: [{ provide: BsDialogBase, useExisting: BsDialog }],
  host: {
    class: 'dialog',
    '[class.dialog-instant]': '!animation()',
  },
})
export class BsDialog extends BsDialogBase {
  /** Opens as a modal (top layer, backdrop, focus trap). Set `false` for an inline dialog. */
  readonly modal = input(true, { transform: booleanAttribute });

  protected readonly prefix = 'dialog';
  protected readonly deferClose = true;
  protected override readonly nonmodalClass = 'dialog-nonmodal';

  protected injectConfig(): Partial<BsDialogConfig> {
    return inject(BS_DIALOG_CONFIG);
  }

  protected isModal(): boolean {
    return this.modal();
  }

  protected locksScroll(): boolean {
    return this.modal();
  }
}
