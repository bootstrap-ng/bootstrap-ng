import { Component, signal } from '@angular/core';
import { BsTable, BsTableColumn, BsTableSort } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

@Component({
  selector: 'docs-table-virtual-example',
  imports: [BsTable],
  templateUrl: './virtual.html',
})
export class TableVirtualExample {
  protected readonly employees: Employee[] = Array.from(
    { length: Math.ceil(10_000 / EMPLOYEES.length) },
    () => EMPLOYEES,
  )
    .flat()
    .slice(0, 10_000)
    .map((employee, i) => ({ ...employee, id: i + 1 }));
  protected readonly sort = signal<BsTableSort | null>(null);
  protected readonly rowKey = (row: Employee) => row.id;
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'id', header: '#', sortable: true, width: 80 },
    { key: 'name', header: 'Name', sortable: true, width: 180 },
    { key: 'role', header: 'Role', sortable: true, width: 160 },
    { key: 'department', header: 'Department', sortable: true },
  ]);
}
