import { Component } from '@angular/core';
import { BsToast, BsToastClose, BsButton, BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-toast-basic-example',
  imports: [BsToast, BsToastClose, BsButton, BsCloseButton],
  templateUrl: './basic.html',
})
export class ToastBasicExample {}
