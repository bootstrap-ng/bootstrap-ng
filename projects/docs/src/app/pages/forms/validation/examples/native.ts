import { Component } from '@angular/core';
import {
  BsButton,
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsInvalidFeedback,
  BsValidate,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-validation-native-example',
  imports: [BsButton, BsFormControl, BsFormField, BsFormLabel, BsInvalidFeedback, BsValidate],
  templateUrl: './native.html',
})
export class ValidationNativeExample {}
