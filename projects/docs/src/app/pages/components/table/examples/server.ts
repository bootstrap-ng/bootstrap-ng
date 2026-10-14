import { Component, computed, resource, signal } from '@angular/core';
import { BsPagination, BsTable, BsTableColumn, BsTableSort } from 'bootstrap-ng';
import { Employee, EMPLOYEES } from './employees';

const PAGE_SIZE = 5;

/** Pretends to be a server API that sorts and pages. */
async function fetchEmployees(sort: BsTableSort | null, page: number) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const rows = [...EMPLOYEES];
  if (sort) {
    const key = sort.key as keyof Employee;
    const factor = sort.direction === 'asc' ? 1 : -1;
    rows.sort((a, b) => String(a[key]).localeCompare(String(b[key])) * factor);
  }
  const start = (page - 1) * PAGE_SIZE;
  return { rows: rows.slice(start, start + PAGE_SIZE), total: rows.length };
}

@Component({
  selector: 'docs-table-server-example',
  imports: [BsTable, BsPagination],
  templateUrl: './server.html',
})
export class TableServerExample {
  protected readonly pageSize = PAGE_SIZE;
  protected readonly sort = signal<BsTableSort | null>(null);
  protected readonly page = signal(1);
  protected readonly result = resource({
    params: () => ({ sort: this.sort(), page: this.page() }),
    loader: ({ params }) => fetchEmployees(params.sort, params.page),
  });
  protected readonly rows = computed(() => this.result.value()?.rows ?? []);
  protected readonly total = computed(() => this.result.value()?.total ?? 0);
  protected readonly columns = signal<BsTableColumn<Employee>[]>([
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
  ]);
}
