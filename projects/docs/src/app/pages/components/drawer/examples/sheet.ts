import { Component } from '@angular/core';
import { BsButton, BsCloseButton, BsDialogClose, BsDrawer, BsDrawerToggle } from 'bootstrap-ng';

@Component({
  selector: 'docs-drawer-sheet-example',
  imports: [BsButton, BsCloseButton, BsDialogClose, BsDrawer, BsDrawerToggle],
  templateUrl: './sheet.html',
})
export class DrawerSheetExample {}
