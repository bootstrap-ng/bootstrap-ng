import { Component } from '@angular/core';
import { BsToast, BsToastClose, BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-toast-static-example',
  imports: [BsToast, BsToastClose, BsCloseButton],
  templateUrl: './static.html',
})
export class ToastStaticExample {}
