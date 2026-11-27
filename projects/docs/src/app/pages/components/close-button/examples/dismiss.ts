import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BsButton, BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-close-button-dismiss-example',
  imports: [BsButton, BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dismiss.html',
})
export class CloseButtonDismissExample {
  protected readonly visible = signal(true);
}
