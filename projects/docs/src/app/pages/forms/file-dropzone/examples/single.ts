import { Component } from '@angular/core';
import { BsFileDropzone } from 'bootstrap-ng';

@Component({
  selector: 'docs-file-dropzone-single-example',
  imports: [BsFileDropzone],
  templateUrl: './single.html',
})
export class FileDropzoneSingleExample {}
