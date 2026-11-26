import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsDialog, BsDialogClose, BsButton, BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-dialog-fullscreen-example',
  imports: [BsDialog, BsDialogClose, BsButton, BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fullscreen.html',
})
export class DialogFullscreenExample {
  protected readonly variants = [
    'dialog-fullscreen',
    'sm-down:dialog-fullscreen',
    'md-down:dialog-fullscreen',
    'lg-down:dialog-fullscreen',
    'xl-down:dialog-fullscreen',
    '2xl-down:dialog-fullscreen',
  ];
}
