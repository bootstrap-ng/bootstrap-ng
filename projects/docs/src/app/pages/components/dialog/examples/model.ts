import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BsDialog, BsDialogClose, BsButton, BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-dialog-model-example',
  imports: [BsDialog, BsDialogClose, BsButton, BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './model.html',
})
export class DialogModelExample {
  protected readonly confirming = signal(false);
  protected readonly result = signal('none');

  protected answer(result: string): void {
    this.result.set(result);
    this.confirming.set(false);
  }
}
