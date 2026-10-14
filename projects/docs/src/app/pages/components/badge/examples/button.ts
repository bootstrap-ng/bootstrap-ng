import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsBadge, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-badge-button-example',
  imports: [BsBadge, BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
})
export class BadgeButtonExample {}
