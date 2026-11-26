import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsDialog, BsDialogClose, BsButton, BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-dialog-sizes-example',
  imports: [BsDialog, BsDialogClose, BsButton, BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sizes.html',
})
export class DialogSizesExample {
  protected readonly sizes = ['sm', 'lg', 'xl', '2xl'];
}
