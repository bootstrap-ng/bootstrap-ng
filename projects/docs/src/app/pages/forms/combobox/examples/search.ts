import { Component, signal } from '@angular/core';
import {
  BsCombobox,
  BsComboboxMenu,
  BsComboboxNoResults,
  BsComboboxOption,
  BsComboboxSearch,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-combobox-search-example',
  imports: [BsCombobox, BsComboboxMenu, BsComboboxOption, BsComboboxSearch, BsComboboxNoResults],
  templateUrl: './search.html',
})
export class ComboboxSearchExample {
  protected readonly country = signal<unknown>(null);
}
