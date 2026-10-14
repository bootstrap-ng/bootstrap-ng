import { Component, signal } from '@angular/core';
import { BsChip, BsChipDismiss } from 'bootstrap-ng';

@Component({
  selector: 'docs-chips-basic-example',
  imports: [BsChip, BsChipDismiss],
  templateUrl: './basic.html',
})
export class ChipsBasicExample {
  protected readonly dismissed = signal(false);
}
