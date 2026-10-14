import { Component } from '@angular/core';
import { BsButton, BsCombobox, BsComboboxMenu, BsComboboxOption } from 'bootstrap-ng';

@Component({
  selector: 'docs-combobox-submission-example',
  imports: [BsCombobox, BsComboboxMenu, BsComboboxOption, BsButton],
  templateUrl: './submission.html',
})
export class ComboboxSubmissionExample {}
