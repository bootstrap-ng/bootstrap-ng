import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsProgress } from 'bootstrap-ng';

@Component({
  selector: 'docs-progress-basic-example',
  imports: [BsProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basic.html',
})
export class ProgressBasicExample {}
