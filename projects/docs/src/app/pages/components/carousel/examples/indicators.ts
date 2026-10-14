import { Component, signal } from '@angular/core';
import {
  BsCarousel,
  BsCarouselItem,
  BsCarouselPrev,
  BsCarouselNext,
  BsCarouselIndicator,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-carousel-indicators-example',
  imports: [BsCarousel, BsCarouselItem, BsCarouselPrev, BsCarouselNext, BsCarouselIndicator],
  templateUrl: './indicators.html',
})
export class CarouselIndicatorsExample {
  protected readonly slide = signal(0);
}
