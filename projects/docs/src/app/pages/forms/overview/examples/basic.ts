import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  BsButton,
  BsCheck,
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsLabel,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-overview-basic-example',
  imports: [
    ReactiveFormsModule,
    BsButton,
    BsCheck,
    BsFormControl,
    BsFormField,
    BsFormLabel,
    BsFormText,
    BsLabel,
  ],
  templateUrl: './basic.html',
})
export class OverviewBasicExample {
  protected readonly form = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    remember: new FormControl(false),
  });
  protected readonly submitted = signal('');

  protected save(): void {
    this.submitted.set(JSON.stringify(this.form.value));
  }
}
