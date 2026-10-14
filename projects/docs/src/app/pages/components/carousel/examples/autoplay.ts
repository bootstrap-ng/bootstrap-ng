import { Component } from '@angular/core';
import {
  BsCarousel,
  BsCarouselItem,
  BsCarouselPrev,
  BsCarouselNext,
  BsCarouselIndicator,
  BsCarouselPlayPause,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-carousel-autoplay-example',
  imports: [
    BsCarousel,
    BsCarouselItem,
    BsCarouselPrev,
    BsCarouselNext,
    BsCarouselIndicator,
    BsCarouselPlayPause,
  ],
  templateUrl: './autoplay.html',
})
export class CarouselAutoplayExample {}
