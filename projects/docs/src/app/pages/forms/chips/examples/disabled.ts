import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsChipInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-chips-disabled-example',
  imports: [ReactiveFormsModule, BsChipInput],
  templateUrl: './disabled.html',
})
export class ChipsDisabledExample {
  protected readonly tags = new FormControl({ value: ['Read only', 'Locked'], disabled: true });
}
