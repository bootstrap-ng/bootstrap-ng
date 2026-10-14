import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BsProgress, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-progress-labels-example',
  imports: [BsProgress, BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './labels.html',
})
export class ProgressLabelsExample {
  protected readonly files = signal(3);
}
