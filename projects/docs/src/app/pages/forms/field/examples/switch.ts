import { Component } from '@angular/core';
import { BsFormField, BsLabel, BsSwitch, BsSwitchInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-field-switch-example',
  imports: [BsFormField, BsLabel, BsSwitch, BsSwitchInput],
  templateUrl: './switch.html',
})
export class FieldSwitchExample {}
