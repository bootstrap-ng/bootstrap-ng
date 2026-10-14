import { Component } from '@angular/core';
import { BsCarousel, BsCarouselItem, BsCarouselPrev, BsCarouselNext } from 'bootstrap-ng';

@Component({
  selector: 'docs-carousel-overlay-example',
  imports: [BsCarousel, BsCarouselItem, BsCarouselPrev, BsCarouselNext],
  templateUrl: './overlay.html',
})
export class CarouselOverlayExample {}
