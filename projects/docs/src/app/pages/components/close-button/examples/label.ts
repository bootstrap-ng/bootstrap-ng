import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-close-button-label-example',
  imports: [BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './label.html',
})
export class CloseButtonLabelExample {}
