import { Component, signal } from '@angular/core';
import { BsCombobox, BsComboboxMenu, BsComboboxOption } from 'bootstrap-ng';

@Component({
  selector: 'docs-combobox-multiple-example',
  imports: [BsCombobox, BsComboboxMenu, BsComboboxOption],
  templateUrl: './multiple.html',
})
export class ComboboxMultipleExample {
  protected readonly skills = signal<unknown>(['css']);
}
