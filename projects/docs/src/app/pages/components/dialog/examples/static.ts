import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsDialog, BsDialogClose, BsButton, BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-dialog-static-example',
  imports: [BsDialog, BsDialogClose, BsButton, BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './static.html',
})
export class DialogStaticExample {}
