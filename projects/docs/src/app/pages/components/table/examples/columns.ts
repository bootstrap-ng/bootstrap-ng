import { Component, signal } from '@angular/core';
import { BsButton, BsCheck, BsTable, BsTableColumn } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-columns-example',
  imports: [BsTable, BsCheck, BsButton],
  templateUrl: './columns.html',
})
export class TableColumnsExample {
  protected readonly employees = EMPLOYEES.slice(0, 5);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name', width: 180 },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department', hidden: true },
    { key: 'started', header: 'Started', cellClass: 'text-nowrap' },
  ]);

  protected toggle(key: string, visible: boolean): void {
    this.columns.update((columns) =>
      columns.map((column) => (column.key === key ? { ...column, hidden: !visible } : column)),
    );
  }
}
