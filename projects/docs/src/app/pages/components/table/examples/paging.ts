import { Component, signal } from '@angular/core';
import {
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsPagination,
  BsTable,
  BsTableColumn,
  BsTableSort,
} from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-paging-example',
  imports: [BsTable, BsPagination, BsFormControl, BsFormField, BsFormLabel],
  templateUrl: './paging.html',
})
export class TablePagingExample {
  protected readonly employees = EMPLOYEES;
  protected readonly search = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(8);
  protected readonly sort = signal<BsTableSort | null>(null);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
  ]);

  protected onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }
}
