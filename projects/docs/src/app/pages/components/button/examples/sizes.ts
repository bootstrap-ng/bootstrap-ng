import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-button-sizes-example',
  imports: [BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sizes.html',
})
export class ButtonSizesExample {}
