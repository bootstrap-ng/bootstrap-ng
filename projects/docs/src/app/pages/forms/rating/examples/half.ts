import { Component, signal } from '@angular/core';
import { BsRating } from 'bootstrap-ng';

@Component({
  selector: 'docs-rating-half-example',
  imports: [BsRating],
  templateUrl: './half.html',
})
export class RatingHalfExample {
  protected readonly rating = signal(2.5);
}
