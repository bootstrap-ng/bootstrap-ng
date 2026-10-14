import { Component } from '@angular/core';
import {
  BsButton,
  BsCheck,
  BsFormControl,
  BsFormField,
  BsInputGroup,
  BsInputGroupText,
  BsLabel,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-layout-inline-example',
  imports: [BsButton, BsCheck, BsFormControl, BsFormField, BsInputGroup, BsInputGroupText, BsLabel],
  templateUrl: './inline.html',
})
export class LayoutInlineExample {}
