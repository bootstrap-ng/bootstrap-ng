import { Component } from '@angular/core';
import { BsFormField, BsFormLabel, BsRange, BsRangeInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-range-disabled-example',
  imports: [BsRange, BsRangeInput, BsFormField, BsFormLabel],
  templateUrl: './disabled.html',
})
export class RangeDisabledExample {}
