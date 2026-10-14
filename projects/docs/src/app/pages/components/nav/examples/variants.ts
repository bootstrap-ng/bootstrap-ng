import { Component } from '@angular/core';
import { BsNav, BsNavLink } from 'bootstrap-ng';

@Component({
  selector: 'docs-nav-variants-example',
  imports: [BsNav, BsNavLink],
  templateUrl: './variants.html',
})
export class NavVariantsExample {
  protected readonly variants = ['tabs', 'pills', 'underline'] as const;
}
