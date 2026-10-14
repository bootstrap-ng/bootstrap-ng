import { Component } from '@angular/core';
import { BsButton, BsCloseButton, BsDialogClose, BsDrawer, BsDrawerToggle } from 'bootstrap-ng';

@Component({
  selector: 'docs-drawer-static-example',
  imports: [BsButton, BsCloseButton, BsDialogClose, BsDrawer, BsDrawerToggle],
  templateUrl: './static.html',
})
export class DrawerStaticExample {}
