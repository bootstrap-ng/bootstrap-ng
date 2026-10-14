import { Component, signal } from '@angular/core';
import { BsRating, BsRatingStar } from 'bootstrap-ng';

@Component({
  selector: 'docs-rating-custom-example',
  imports: [BsRating, BsRatingStar],
  templateUrl: './custom.html',
})
export class RatingCustomExample {
  protected readonly rating = signal(3);
}
