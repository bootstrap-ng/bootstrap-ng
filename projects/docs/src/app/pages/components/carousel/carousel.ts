import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { CarouselBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { CarouselIndicatorsExample } from './examples/indicators';
import indicatorsHtml from './examples/indicators.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import indicatorsTs from './examples/indicators.ts' with { loader: 'text' };
import { CarouselOverlayExample } from './examples/overlay';
import overlayHtml from './examples/overlay.html' with { loader: 'text' };
import { CarouselAutoplayExample } from './examples/autoplay';
import autoplayHtml from './examples/autoplay.html' with { loader: 'text' };
import { CarouselEndsExample } from './examples/ends';
import endsHtml from './examples/ends.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Carousel',
  lead: 'A slideshow built on CSS scroll snapping: the browser handles sliding, swiping and momentum, and bootstrap-ng handles the active slide, controls, keyboard and autoplay.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/carousel/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Put <code>bsCarouselItem</code> slides in a <code>.carousel-inner</code>. <code>bsCarouselPrev</code> and <code>bsCarouselNext</code> can go anywhere inside the carousel. Give the carousel an <code>aria-label</code>. Focus the carousel and use the arrow keys to move between slides. Screen readers announce the new slide, except while autoplay is on.',
      example: CarouselBasicExample,
      html: basicHtml,
    },
    {
      id: 'indicators',
      title: 'Indicators',
      description:
        'Add <code>bsCarouselIndicator</code> buttons with the slide index in a <code>.carousel-indicators</code> element. Bind <code>[(active)]</code> to read or set the active slide.',
      example: CarouselIndicatorsExample,
      html: indicatorsHtml,
      ts: indicatorsTs,
    },
    {
      id: 'overlay',
      title: 'Overlay controls and crossfade',
      description:
        'Add <code>.carousel-overlay</code> and wrap controls in <code>.carousel-overlay-controls</code> to place them over the slides. Add <code>.carousel-fade</code> to crossfade instead of sliding.',
      example: CarouselOverlayExample,
      html: overlayHtml,
    },
    {
      id: 'autoplay',
      title: 'Autoplay',
      description:
        '<code>autoplay</code> cycles through the slides every <code>interval</code> milliseconds, pausing on hover and while the page is hidden. Using a control, an indicator, the keyboard or swiping stops autoplay for good. Always add a <code>bsCarouselPlayPause</code> button, as WCAG 2.2.2 requires a way to pause moving content.',
      example: CarouselAutoplayExample,
      html: autoplayHtml,
    },
    {
      id: 'ends',
      title: 'End behavior',
      description:
        'By default (<code>ends="loop"</code>) the carousel keeps sliding in the same direction past the last or first slide, onto the other end. <code>wrap</code> jumps back instead, which is also what <code>loop</code> does for layouts showing several slides and for users who prefer reduced motion. With <code>ends="stop"</code>, shown here, the carousel stops at the first and last slide and disables the previous or next button there, moving focus to the other one.',
      example: CarouselEndsExample,
      html: endsHtml,
    },
  ],
  api: [
    {
      name: 'BsCarousel',
      selector: '[bsCarousel]',
      exportAs: 'bsCarousel',
      inputs: [
        {
          name: 'active',
          type: 'number',
          default: '0',
          description: 'Index of the active slide. Supports [(active)].',
        },
        {
          name: 'autoplay',
          type: 'boolean',
          default: 'false',
          description: 'Cycles through the slides.',
        },
        {
          name: 'interval',
          type: 'number',
          default: '5000',
          description: 'Milliseconds between slides while playing.',
        },
        {
          name: 'pauseOnHover',
          type: 'boolean',
          default: 'true',
          description: 'Pauses autoplay while the pointer is over the carousel.',
        },
        {
          name: 'ends',
          type: "'loop' | 'wrap' | 'stop'",
          default: "'loop'",
          description: 'What happens past the first and last slide.',
        },
        {
          name: 'keyboard',
          type: 'boolean',
          default: 'true',
          description: 'Moves between slides with the arrow keys.',
        },
        {
          name: 'id',
          type: 'string',
          default: 'generated',
          description: 'Element id, used by the controls for aria-controls.',
        },
      ],
      outputs: [
        {
          name: 'activeChange',
          type: 'number',
          description: 'Emits the new active slide index.',
        },
      ],
      methods: [
        {
          name: 'next()',
          type: 'void',
          description: 'Shows the next slide.',
        },
        {
          name: 'prev()',
          type: 'void',
          description: 'Shows the previous slide.',
        },
        {
          name: 'to(index)',
          type: 'void',
          description: 'Shows the slide at index.',
        },
        {
          name: 'play()',
          type: 'void',
          description: 'Starts autoplay.',
        },
        {
          name: 'pause()',
          type: 'void',
          description: 'Stops autoplay.',
        },
        {
          name: 'isPlaying',
          type: 'Signal<boolean>',
          description: 'Whether autoplay is on.',
        },
        {
          name: 'count',
          type: 'Signal<number>',
          description: 'Number of slides.',
        },
        {
          name: 'lastIndex',
          type: 'Signal<number>',
          description:
            'Index of the last slide that can scroll to the start. Lower than count - 1 when several slides are visible.',
        },
      ],
    },
    {
      name: 'BsCarouselItem',
      selector: '[bsCarouselItem]',
      exportAs: 'bsCarouselItem',
      inputs: [],
    },
    {
      name: 'BsCarouselPrev',
      selector: '[bsCarouselPrev]',
      inputs: [],
    },
    {
      name: 'BsCarouselNext',
      selector: '[bsCarouselNext]',
      inputs: [],
    },
    {
      name: 'BsCarouselIndicator',
      selector: '[bsCarouselIndicator]',
      inputs: [
        {
          name: 'bsCarouselIndicator',
          type: 'number',
          default: 'required',
          description: 'Index of the slide it shows.',
        },
        {
          name: 'aria-label',
          type: 'string',
          default: 'Slide n',
          description: 'Accessible label.',
        },
      ],
    },
    {
      name: 'BsCarouselPlayPause',
      selector: '[bsCarouselPlayPause]',
      inputs: [
        {
          name: 'pauseLabel',
          type: 'string',
          default: "'Pause'",
          description: 'Accessible label while playing.',
        },
        {
          name: 'playLabel',
          type: 'string',
          default: "'Play'",
          description: 'Accessible label while paused.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-carousel-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class CarouselPage {
  protected readonly page = PAGE;
}
