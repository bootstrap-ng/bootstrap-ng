import { Component, signal } from '@angular/core';
import { BsFileDropzone } from 'bootstrap-ng';

@Component({
  selector: 'docs-file-dropzone-basic-example',
  imports: [BsFileDropzone],
  templateUrl: './basic.html',
})
export class FileDropzoneBasicExample {
  protected readonly files = signal<File[]>([]);
}
