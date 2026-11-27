import { Component } from '@angular/core';
import { BsNav, BsScrollspy } from 'bootstrap-ng';

@Component({
  selector: 'docs-scrollspy-nested-example',
  imports: [BsNav, BsScrollspy],
  templateUrl: './nested.html',
})
export class ScrollspyNestedExample {
  protected readonly items = ['1', '1-1', '1-2', '2', '3', '3-1', '3-2'];
}
