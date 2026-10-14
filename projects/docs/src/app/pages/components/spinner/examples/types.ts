import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsSpinner } from 'bootstrap-ng';

@Component({
  selector: 'docs-spinner-types-example',
  imports: [BsSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './types.html',
})
export class SpinnerTypesExample {}
