import { Component, signal } from '@angular/core';
import { BsPagination } from 'bootstrap-ng';

@Component({
  selector: 'docs-pagination-basic-example',
  imports: [BsPagination],
  templateUrl: './basic.html',
})
export class PaginationBasicExample {
  protected readonly page = signal(1);
}
