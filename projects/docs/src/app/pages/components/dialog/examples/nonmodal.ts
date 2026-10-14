import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsDialog, BsDialogClose, BsButton, BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-dialog-nonmodal-example',
  imports: [BsDialog, BsDialogClose, BsButton, BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nonmodal.html',
})
export class DialogNonmodalExample {}
