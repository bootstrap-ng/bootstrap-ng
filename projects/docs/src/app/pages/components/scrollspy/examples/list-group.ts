import { Component } from '@angular/core';
import { BsListGroup, BsListGroupItem, BsScrollspy } from 'bootstrap-ng';

@Component({
  selector: 'docs-scrollspy-list-group-example',
  imports: [BsListGroup, BsListGroupItem, BsScrollspy],
  templateUrl: './list-group.html',
})
export class ScrollspyListGroupExample {
  protected readonly items = [1, 2, 3, 4];
}
