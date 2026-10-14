import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsProgress, BsProgressStacked } from 'bootstrap-ng';

@Component({
  selector: 'docs-progress-stacked-example',
  imports: [BsProgress, BsProgressStacked],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stacked.html',
})
export class ProgressStackedExample {}
