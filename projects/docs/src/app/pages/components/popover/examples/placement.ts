import { Component } from '@angular/core';
import { BsPopover, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-popover-placement-example',
  imports: [BsPopover, BsButton],
  templateUrl: './placement.html',
})
export class PopoverPlacementExample {
  protected readonly placements = ['top', 'end', 'bottom', 'start'] as const;
}
