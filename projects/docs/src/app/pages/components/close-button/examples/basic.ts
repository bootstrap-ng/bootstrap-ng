import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-close-button-basic-example',
  imports: [BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basic.html',
})
export class CloseButtonBasicExample {}
