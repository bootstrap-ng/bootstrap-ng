import { Component, signal } from '@angular/core';
import { BsChipInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-chips-keyboard-example',
  imports: [BsChipInput],
  templateUrl: './keyboard.html',
})
export class ChipsKeyboardExample {
  protected readonly fruits = signal(['Apple', 'Banana', 'Cherry', 'Date']);
}
