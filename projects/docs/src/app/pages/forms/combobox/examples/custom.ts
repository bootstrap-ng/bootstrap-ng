import { Component, signal } from '@angular/core';
import { BsCombobox, BsComboboxMenu, BsComboboxOption } from 'bootstrap-ng';

@Component({
  selector: 'docs-combobox-custom-example',
  imports: [BsCombobox, BsComboboxMenu, BsComboboxOption],
  templateUrl: './custom.html',
})
export class ComboboxCustomExample {
  protected readonly language = signal<unknown>('css');
  protected readonly role = signal<unknown>('editor');
}
