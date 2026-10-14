import { Component } from '@angular/core';
import {
  BsFormControl,
  BsFormFloating,
  BsInputGroup,
  BsInputGroupText,
  BsLabel,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-floating-labels-input-groups-example',
  imports: [BsFormControl, BsFormFloating, BsLabel, BsInputGroup, BsInputGroupText],
  templateUrl: './input-groups.html',
})
export class FloatingLabelsInputGroupsExample {}
