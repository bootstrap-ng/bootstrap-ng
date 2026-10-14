import { Component, signal } from '@angular/core';
import { BsCheck, BsFormField, BsLabel, BsTable, BsTableColumn } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-variants-example',
  imports: [BsTable, BsCheck, BsFormField, BsLabel],
  templateUrl: './variants.html',
})
export class TableVariantsExample {
  protected readonly employees = EMPLOYEES.slice(0, 4);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
  ]);
  protected readonly striped = signal(true);
  protected readonly hover = signal(true);
  protected readonly bordered = signal(false);
  protected readonly borderless = signal(false);
  protected readonly small = signal(false);
}
