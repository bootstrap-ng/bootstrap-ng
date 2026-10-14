import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsSpinner, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-spinner-button-example',
  imports: [BsSpinner, BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
})
export class SpinnerButtonExample {}
