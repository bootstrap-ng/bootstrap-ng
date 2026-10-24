import { Component, signal } from '@angular/core';
import { BsTable, BsTableColumn, BsTableSort } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-multisort-example',
  imports: [BsTable],
  templateUrl: './multisort.html',
})
export class TableMultisortExample {
  protected readonly employees = EMPLOYEES.slice(0, 8);
  protected readonly sorts = signal<BsTableSort[]>([
    { key: 'department', direction: 'asc' },
    { key: 'salary', direction: 'desc' },
  ]);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    {
      key: 'salary',
      header: 'Salary',
      sortable: true,
      align: 'end',
      format: (value) => `$${(value as number).toLocaleString('en-US')}`,
    },
  ]);
}
