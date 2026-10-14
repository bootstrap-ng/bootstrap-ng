import { Component, signal } from '@angular/core';
import {
  BsButton,
  BsCheck,
  BsFormField,
  BsLabel,
  BsTable,
  BsTableColumn,
  BsTableEmpty,
} from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-states-example',
  imports: [BsTable, BsTableEmpty, BsButton, BsCheck, BsFormField, BsLabel],
  templateUrl: './states.html',
})
export class TableStatesExample {
  protected readonly loading = signal(true);
  protected readonly empty = signal(false);
  protected readonly employees = EMPLOYEES.slice(0, 3);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
  ]);
}
