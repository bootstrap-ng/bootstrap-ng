import { Component } from '@angular/core';
import {
  BsButton,
  BsCloseButton,
  BsDialogClose,
  BsDrawer,
  BsDrawerToggle,
  BsMenu,
  BsMenuToggle,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-navbar-menu-example',
  imports: [BsButton, BsCloseButton, BsDialogClose, BsDrawer, BsDrawerToggle, BsMenu, BsMenuToggle],
  templateUrl: './menu.html',
})
export class NavbarMenuExample {}
