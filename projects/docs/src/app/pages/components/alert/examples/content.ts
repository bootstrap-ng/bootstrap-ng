import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsAlert } from 'bootstrap-ng';

@Component({
  selector: 'docs-alert-content-example',
  imports: [BsAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content.html',
})
export class AlertContentExample {}
