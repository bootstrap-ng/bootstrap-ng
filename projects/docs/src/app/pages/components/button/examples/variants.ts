import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-button-variants-example',
  imports: [BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './variants.html',
})
export class ButtonVariantsExample {}
