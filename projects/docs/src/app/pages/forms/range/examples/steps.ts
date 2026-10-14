import { Component } from '@angular/core';
import { BsFormField, BsFormLabel, BsRange, BsRangeInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-range-steps-example',
  imports: [BsRange, BsRangeInput, BsFormField, BsFormLabel],
  templateUrl: './steps.html',
})
export class RangeStepsExample {}
