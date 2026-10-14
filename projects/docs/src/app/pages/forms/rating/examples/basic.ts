import { Component, signal } from '@angular/core';
import { BsRating } from 'bootstrap-ng';

@Component({
  selector: 'docs-rating-basic-example',
  imports: [BsRating],
  templateUrl: './basic.html',
})
export class RatingBasicExample {
  protected readonly rating = signal(3);
}
