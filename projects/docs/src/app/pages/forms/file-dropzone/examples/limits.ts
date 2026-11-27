import { Component, signal } from '@angular/core';
import { BsFileDropzone, formatFileSize } from 'bootstrap-ng';

@Component({
  selector: 'docs-file-dropzone-limits-example',
  imports: [BsFileDropzone],
  templateUrl: './limits.html',
})
export class FileDropzoneLimitsExample {
  protected readonly maxFileSize = 2_000_000;
  protected readonly maxFileSizeText = formatFileSize(this.maxFileSize);
  protected readonly photos = signal<File[]>([]);
  protected readonly rejectedCount = signal(0);
}
