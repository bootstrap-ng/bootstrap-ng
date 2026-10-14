import { Component, signal } from '@angular/core';
import { BsTable, BsTableColumn } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-basic-example',
  imports: [BsTable],
  templateUrl: './basic.html',
})
export class TableBasicExample {
  protected readonly employees = EMPLOYEES.slice(0, 5);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
    { key: 'started', header: 'Started' },
  ]);
}
