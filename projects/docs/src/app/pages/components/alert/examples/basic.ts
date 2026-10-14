import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsAlert } from 'bootstrap-ng';

@Component({
  selector: 'docs-alert-basic-example',
  imports: [BsAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basic.html',
})
export class AlertBasicExample {}
