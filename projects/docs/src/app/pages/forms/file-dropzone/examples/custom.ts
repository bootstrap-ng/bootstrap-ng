import { Component, signal } from '@angular/core';
import { BsButton, BsFileDropzone } from 'bootstrap-ng';

@Component({
  selector: 'docs-file-dropzone-custom-example',
  imports: [BsButton, BsFileDropzone],
  templateUrl: './custom.html',
})
export class FileDropzoneCustomExample {
  protected readonly files = signal<File[]>([]);
}
