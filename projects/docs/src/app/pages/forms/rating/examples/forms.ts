import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsFormField, BsFormText, BsInvalidFeedback, BsRating } from 'bootstrap-ng';

@Component({
  selector: 'docs-rating-forms-example',
  imports: [ReactiveFormsModule, BsFormField, BsFormText, BsInvalidFeedback, BsRating],
  templateUrl: './forms.html',
})
export class RatingFormsExample {
  protected readonly rating = new FormControl<number | null>(null, Validators.required);
}
