import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { BsButton, BsCloseButton, BsDialogClose, BsDialogRef, BsDialogService } from 'bootstrap-ng';

@Component({
  selector: 'docs-confirm-delete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BsButton, BsCloseButton, BsDialogClose],
  template: `
    <div class="dialog-header">
      <h1 class="dialog-title">Delete {{ name() }}?</h1>
      <button type="button" bsCloseButton bsDialogClose></button>
    </div>
    <div class="dialog-body">
      <p class="mb-0">You cannot undo this.</p>
    </div>
    <div class="dialog-footer">
      <button type="button" bsButton theme="secondary" bsDialogClose>Cancel</button>
      <button type="button" bsButton theme="danger" (click)="ref.close(true)">Delete</button>
    </div>
  `,
})
export class ConfirmDelete {
  protected readonly ref = inject<BsDialogRef<boolean>>(BsDialogRef);
  readonly name = input.required<string>();
}

@Component({
  selector: 'docs-dialog-service-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BsButton],
  templateUrl: './service.html',
})
export class DialogServiceExample {
  private readonly dialogs = inject(BsDialogService);
  protected readonly result = signal('none');

  protected async remove(): Promise<void> {
    const ref = this.dialogs.open<ConfirmDelete, boolean>(ConfirmDelete, {
      inputs: { name: 'report.pdf' },
    });
    const deleted = await ref.result;
    this.result.set(deleted ? 'deleted' : 'kept');
  }
}
