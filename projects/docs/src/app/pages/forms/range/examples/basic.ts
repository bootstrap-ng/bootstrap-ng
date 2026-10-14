import { Component } from '@angular/core';
import { BsFormField, BsFormLabel, BsRange, BsRangeInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-range-basic-example',
  imports: [BsRange, BsRangeInput, BsFormField, BsFormLabel],
  templateUrl: './basic.html',
})
export class RangeBasicExample {}
