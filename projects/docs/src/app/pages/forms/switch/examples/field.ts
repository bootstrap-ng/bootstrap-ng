import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsFormField, BsLabel, BsSwitch, BsSwitchInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-switch-field-example',
  imports: [FormsModule, BsFormField, BsLabel, BsSwitch, BsSwitchInput],
  templateUrl: './field.html',
})
export class SwitchFieldExample {
  protected readonly wifi = signal(true);
}
