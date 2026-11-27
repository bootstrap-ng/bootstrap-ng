import { Component } from '@angular/core';
import { BsMenu, BsMenuToggle, BsScrollspy } from 'bootstrap-ng';

@Component({
  selector: 'docs-scrollspy-navbar-example',
  imports: [BsMenu, BsMenuToggle, BsScrollspy],
  templateUrl: './navbar.html',
})
export class ScrollspyNavbarExample {
  protected readonly sections = ['first', 'second', 'third', 'fourth'];
}
