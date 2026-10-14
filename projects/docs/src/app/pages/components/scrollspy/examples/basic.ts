import { Component, signal } from '@angular/core';
import { BsScrollspy, BsNav, BsNavLink } from 'bootstrap-ng';

@Component({
  selector: 'docs-scrollspy-basic-example',
  imports: [BsScrollspy, BsNav, BsNavLink],
  templateUrl: './basic.html',
})
export class ScrollspyBasicExample {
  protected readonly active = signal<string | null>(null);
}
