import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsButton, BsFormField, BsFormLabel, BsRange, BsRangeInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-range-reactive-example',
  imports: [ReactiveFormsModule, BsButton, BsRange, BsRangeInput, BsFormField, BsFormLabel],
  templateUrl: './reactive.html',
})
export class RangeReactiveExample {
  protected readonly volume = new FormControl(30);
}
