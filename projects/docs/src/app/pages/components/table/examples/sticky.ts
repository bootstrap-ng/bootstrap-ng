import { Component, signal } from '@angular/core';
import { BsTable, BsTableColumn } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-sticky-example',
  imports: [BsTable],
  templateUrl: './sticky.html',
})
export class TableStickyExample {
  protected readonly employees = EMPLOYEES.slice(0, 20);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'id', header: '#' },
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
  ]);
}
