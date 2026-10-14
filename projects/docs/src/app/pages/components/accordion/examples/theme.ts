import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody } from 'bootstrap-ng';

@Component({
  selector: 'docs-accordion-theme-example',
  imports: [BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme.html',
})
export class AccordionThemeExample {}
