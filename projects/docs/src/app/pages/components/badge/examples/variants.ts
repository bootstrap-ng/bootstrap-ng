import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsBadge } from 'bootstrap-ng';

@Component({
  selector: 'docs-badge-variants-example',
  imports: [BsBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './variants.html',
})
export class BadgeVariantsExample {}
