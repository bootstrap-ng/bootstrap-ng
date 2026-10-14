import { Component } from '@angular/core';
import {
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsInvalidFeedback,
  BsValidFeedback,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-validation-server-example',
  imports: [BsFormControl, BsFormField, BsFormLabel, BsInvalidFeedback, BsValidFeedback],
  templateUrl: './server.html',
})
export class ValidationServerExample {}
