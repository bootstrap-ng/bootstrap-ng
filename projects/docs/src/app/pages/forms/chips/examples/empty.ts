import { Component, signal } from '@angular/core';
import { BsChipInput, BsFormField, BsFormLabel, BsFormText } from 'bootstrap-ng';

@Component({
  selector: 'docs-chips-empty-example',
  imports: [BsChipInput, BsFormField, BsFormLabel, BsFormText],
  templateUrl: './empty.html',
})
export class ChipsEmptyExample {
  protected readonly recipients = signal<string[]>([]);
}
