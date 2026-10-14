import { Component } from '@angular/core';
import { BsButton, BsCloseButton, BsDialogClose, BsDrawer, BsDrawerToggle } from 'bootstrap-ng';

@Component({
  selector: 'docs-drawer-basic-example',
  imports: [BsButton, BsCloseButton, BsDialogClose, BsDrawer, BsDrawerToggle],
  templateUrl: './basic.html',
})
export class DrawerBasicExample {}
