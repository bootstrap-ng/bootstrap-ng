import { Component, signal } from '@angular/core';
import { BsFileDropzone } from 'bootstrap-ng';

@Component({
  selector: 'docs-file-dropzone-limits-example',
  imports: [BsFileDropzone],
  templateUrl: './limits.html',
})
export class FileDropzoneLimitsExample {
  protected readonly photos = signal<File[]>([]);
  protected readonly rejectedCount = signal(0);
}
