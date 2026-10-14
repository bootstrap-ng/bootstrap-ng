import { Component, signal } from '@angular/core';
import { BsChip } from 'bootstrap-ng';

@Component({
  selector: 'docs-chips-active-example',
  imports: [BsChip],
  templateUrl: './active.html',
})
export class ChipsActiveExample {
  protected readonly filters = signal([
    { name: 'Design', active: true },
    { name: 'Engineering', active: false },
    { name: 'Marketing', active: false },
  ]);

  protected toggle(name: string): void {
    this.filters.update((filters) =>
      filters.map((filter) =>
        filter.name === name ? { ...filter, active: !filter.active } : filter,
      ),
    );
  }
}
