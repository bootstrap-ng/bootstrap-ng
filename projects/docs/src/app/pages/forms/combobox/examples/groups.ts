import { Component, signal } from '@angular/core';
import { BsCombobox, BsComboboxMenu, BsComboboxOption } from 'bootstrap-ng';

@Component({
  selector: 'docs-combobox-groups-example',
  imports: [BsCombobox, BsComboboxMenu, BsComboboxOption],
  templateUrl: './groups.html',
})
export class ComboboxGroupsExample {
  protected readonly language = signal<unknown>(null);
}
