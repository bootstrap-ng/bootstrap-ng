import { Component, signal } from '@angular/core';
import { BsTable, BsTableColumn, BsTableDetail } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-detail-example',
  imports: [BsTable, BsTableDetail],
  templateUrl: './detail.html',
})
export class TableDetailExample {
  protected readonly employees = EMPLOYEES.slice(0, 4);
  protected readonly expanded = signal<Employee[]>([]);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
  ]);
}
