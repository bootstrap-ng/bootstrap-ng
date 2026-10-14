import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsCollapse, BsCollapseToggle, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-collapse-basic-example',
  imports: [BsCollapse, BsCollapseToggle, BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basic.html',
})
export class CollapseBasicExample {}
