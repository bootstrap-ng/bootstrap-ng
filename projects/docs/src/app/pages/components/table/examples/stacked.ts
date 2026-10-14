import { Component, signal } from '@angular/core';
import { BsTable, BsTableColumn } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-stacked-example',
  imports: [BsTable],
  templateUrl: './stacked.html',
})
export class TableStackedExample {
  protected readonly employees = EMPLOYEES.slice(0, 3);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
  ]);
}
