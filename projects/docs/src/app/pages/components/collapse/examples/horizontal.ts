import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsCollapse, BsCollapseToggle, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-collapse-horizontal-example',
  imports: [BsCollapse, BsCollapseToggle, BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './horizontal.html',
})
export class CollapseHorizontalExample {}
