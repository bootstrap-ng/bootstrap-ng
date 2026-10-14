import { Component, signal } from '@angular/core';
import { BsTable, BsTableColumn, BsTableSort } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-sorting-example',
  imports: [BsTable],
  templateUrl: './sorting.html',
})
export class TableSortingExample {
  protected readonly employees = EMPLOYEES.slice(0, 6);
  protected readonly sort = signal<BsTableSort | null>({ key: 'name', direction: 'asc' });
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
    {
      key: 'salary',
      header: 'Salary',
      sortable: true,
      align: 'end',
      format: (value) => `$${(value as number).toLocaleString('en-US')}`,
    },
    { key: 'started', header: 'Started', sortable: true },
  ]);
}
