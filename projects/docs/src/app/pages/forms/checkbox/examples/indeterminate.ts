import { Component, computed, signal } from '@angular/core';
import { BsCheck, BsFormField, BsLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-checkbox-indeterminate-example',
  imports: [BsCheck, BsFormField, BsLabel],
  templateUrl: './indeterminate.html',
})
export class CheckboxIndeterminateExample {
  protected readonly toppings = signal([
    { name: 'Cheese', checked: true },
    { name: 'Mushrooms', checked: false },
    { name: 'Olives', checked: false },
  ]);
  protected readonly all = computed(() => this.toppings().every((t) => t.checked));
  protected readonly some = computed(() => this.toppings().some((t) => t.checked) && !this.all());

  protected setAll(checked: boolean): void {
    this.toppings.update((toppings) => toppings.map((t) => ({ ...t, checked })));
  }

  protected set(index: number, checked: boolean): void {
    this.toppings.update((toppings) =>
      toppings.map((t, i) => (i === index ? { ...t, checked } : t)),
    );
  }
}
