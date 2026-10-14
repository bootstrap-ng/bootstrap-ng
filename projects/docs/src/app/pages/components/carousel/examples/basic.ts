import { Component } from '@angular/core';
import { BsCarousel, BsCarouselItem, BsCarouselPrev, BsCarouselNext } from 'bootstrap-ng';

@Component({
  selector: 'docs-carousel-basic-example',
  imports: [BsCarousel, BsCarouselItem, BsCarouselPrev, BsCarouselNext],
  templateUrl: './basic.html',
})
export class CarouselBasicExample {}
