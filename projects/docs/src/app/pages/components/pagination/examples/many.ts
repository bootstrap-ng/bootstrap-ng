import { Component, signal } from '@angular/core';
import { BsPagination } from 'bootstrap-ng';

@Component({
  selector: 'docs-pagination-many-example',
  imports: [BsPagination],
  templateUrl: './many.html',
})
export class PaginationManyExample {
  protected readonly page = signal(10);
}
