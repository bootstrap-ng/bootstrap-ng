import { Component, signal } from '@angular/core';
import { BsRating } from 'bootstrap-ng';

@Component({
  selector: 'docs-rating-resettable-example',
  imports: [BsRating],
  templateUrl: './resettable.html',
})
export class RatingResettableExample {
  protected readonly rating = signal(2);
}
