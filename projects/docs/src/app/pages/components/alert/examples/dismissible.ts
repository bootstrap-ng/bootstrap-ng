import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BsAlert, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-alert-dismissible-example',
  imports: [BsAlert, BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dismissible.html',
})
export class AlertDismissibleExample {
  protected readonly visible = signal(true);
}
