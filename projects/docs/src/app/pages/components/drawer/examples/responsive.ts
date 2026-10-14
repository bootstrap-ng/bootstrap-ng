import { Component } from '@angular/core';
import { BsButton, BsCloseButton, BsDialogClose, BsDrawer, BsDrawerToggle } from 'bootstrap-ng';

@Component({
  selector: 'docs-drawer-responsive-example',
  imports: [BsButton, BsCloseButton, BsDialogClose, BsDrawer, BsDrawerToggle],
  templateUrl: './responsive.html',
})
export class DrawerResponsiveExample {}
