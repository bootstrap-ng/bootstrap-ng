import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BsButton,
  BsFileDropzone,
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsInvalidFeedback,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-file-dropzone-forms-example',
  imports: [
    ReactiveFormsModule,
    BsButton,
    BsFileDropzone,
    BsFormField,
    BsFormLabel,
    BsFormText,
    BsInvalidFeedback,
  ],
  templateUrl: './forms.html',
})
export class FileDropzoneFormsExample {
  protected readonly attachments = new FormControl<File[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
  protected readonly submitted = signal(false);

  protected send(event: SubmitEvent): void {
    event.preventDefault();
    // Upload the files here, for example as FormData.
    this.submitted.set(true);
  }
}
