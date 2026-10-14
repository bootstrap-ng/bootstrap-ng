import { Component, computed, signal } from '@angular/core';
import {
  BsRadio,
  BsFormField,
  BsLabel,
  BsTable,
  BsTableColumn,
  BsTableSelection,
} from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-selection-example',
  imports: [BsTable, BsRadio, BsFormField, BsLabel],
  templateUrl: './selection.html',
})
export class TableSelectionExample {
  protected readonly employees = EMPLOYEES.slice(0, 5);
  protected readonly mode = signal<BsTableSelection>('multiple');
  protected readonly selected = signal<Employee[]>(EMPLOYEES.slice(1, 2));
  protected readonly names = computed(() =>
    this.selected()
      .map((e) => e.name)
      .join(', '),
  );
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
  ]);
  protected readonly rowKey = (row: Employee) => row.id;

  protected setMode(mode: BsTableSelection): void {
    this.mode.set(mode);
    this.selected.set([]);
  }
}
