import { Component, signal } from '@angular/core';
import { BsCombobox, BsComboboxMenu, BsComboboxOption } from 'bootstrap-ng';

@Component({
  selector: 'docs-combobox-basic-example',
  imports: [BsCombobox, BsComboboxMenu, BsComboboxOption],
  templateUrl: './basic.html',
})
export class ComboboxBasicExample {
  protected readonly fruit = signal<unknown>(null);
}
