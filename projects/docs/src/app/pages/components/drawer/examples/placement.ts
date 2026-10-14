import { Component, signal } from '@angular/core';
import { BsButton, BsCloseButton, BsDialogClose, BsDrawer } from 'bootstrap-ng';

const PLACEMENTS = ['start', 'end', 'top', 'bottom', 'fullscreen'] as const;

@Component({
  selector: 'docs-drawer-placement-example',
  imports: [BsButton, BsCloseButton, BsDialogClose, BsDrawer],
  templateUrl: './placement.html',
})
export class DrawerPlacementExample {
  protected readonly placements = PLACEMENTS;
  protected readonly placement = signal<(typeof PLACEMENTS)[number]>('end');
}
