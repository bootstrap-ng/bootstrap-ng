import { Component } from '@angular/core';
import { BsFormField, BsFormLabel, BsRange, BsRangeInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-range-ticks-example',
  imports: [BsRange, BsRangeInput, BsFormField, BsFormLabel],
  templateUrl: './ticks.html',
})
export class RangeTicksExample {}
