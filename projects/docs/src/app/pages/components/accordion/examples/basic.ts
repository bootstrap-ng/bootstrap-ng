import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody } from 'bootstrap-ng';

@Component({
  selector: 'docs-accordion-basic-example',
  imports: [BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basic.html',
})
export class AccordionBasicExample {}
