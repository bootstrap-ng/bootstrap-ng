import { Component } from '@angular/core';
import { BsFormField, BsLabel, BsSwitch, BsSwitchInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-switch-disabled-example',
  imports: [BsFormField, BsLabel, BsSwitch, BsSwitchInput],
  templateUrl: './disabled.html',
})
export class SwitchDisabledExample {}
