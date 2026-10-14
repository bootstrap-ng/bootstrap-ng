import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody } from 'bootstrap-ng';

@Component({
  selector: 'docs-accordion-multiple-example',
  imports: [BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multiple.html',
})
export class AccordionMultipleExample {}
