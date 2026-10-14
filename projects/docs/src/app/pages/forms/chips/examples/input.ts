import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsChipInput, BsFormField, BsFormLabel, BsFormText } from 'bootstrap-ng';

@Component({
  selector: 'docs-chips-input-example',
  imports: [ReactiveFormsModule, BsChipInput, BsFormField, BsFormLabel, BsFormText],
  templateUrl: './input.html',
})
export class ChipsInputExample {
  protected readonly skills = new FormControl(['JavaScript', 'TypeScript'], { nonNullable: true });
}
