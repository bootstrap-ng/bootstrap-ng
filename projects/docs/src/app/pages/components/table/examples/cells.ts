import { Component, signal } from '@angular/core';
import { BsBadge, BsButton, BsTable, BsTableCell, BsTableColumn } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-cells-example',
  imports: [BsTable, BsTableCell, BsBadge, BsButton],
  templateUrl: './cells.html',
})
export class TableCellsExample {
  protected readonly employees = EMPLOYEES.slice(0, 5);
  protected readonly message = signal('');
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
    {
      key: 'salary',
      header: 'Salary',
      align: 'end',
      format: (value) => `$${(value as number).toLocaleString('en-US')}`,
    },
    { key: 'actions', header: 'Actions', align: 'end', filterable: false },
  ]);

  protected theme(status: Employee['status']) {
    return status === 'Active' ? 'success' : status === 'On leave' ? 'warning' : 'secondary';
  }
}
