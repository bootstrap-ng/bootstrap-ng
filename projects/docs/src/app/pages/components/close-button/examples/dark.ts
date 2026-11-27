import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-close-button-dark-example',
  imports: [BsCloseButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dark.html',
})
export class CloseButtonDarkExample {}
