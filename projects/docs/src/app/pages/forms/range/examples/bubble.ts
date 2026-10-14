import { Component } from '@angular/core';
import { BsFormField, BsFormLabel, BsRange, BsRangeInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-range-bubble-example',
  imports: [BsRange, BsRangeInput, BsFormField, BsFormLabel],
  templateUrl: './bubble.html',
})
export class RangeBubbleExample {
  protected readonly percent = (value: number) => `${value}%`;
}
