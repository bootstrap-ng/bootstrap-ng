import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-close-button-disabled-example',
  imports: [BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './disabled.html',
})
export class CloseButtonDisabledExample {}
