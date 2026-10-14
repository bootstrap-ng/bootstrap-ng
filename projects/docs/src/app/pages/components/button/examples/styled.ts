import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-button-styled-example',
  imports: [BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './styled.html',
})
export class ButtonStyledExample {}
