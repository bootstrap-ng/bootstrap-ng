import { Component, signal } from '@angular/core';
import { BsTable, BsTableColumn } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-pinned-example',
  imports: [BsTable],
  templateUrl: './pinned.html',
})
export class TablePinnedExample {
  protected readonly employees = EMPLOYEES.slice(0, 6);
  protected readonly rowKey = (row: Employee) => row.id;
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name', pinned: 'start' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
    {
      key: 'salary',
      header: 'Salary',
      align: 'end',
      format: (value) => `$${(value as number).toLocaleString('en-US')}`,
    },
    { key: 'started', header: 'Started' },
    { key: 'status', header: 'Status', pinned: 'end' },
  ]);
}
