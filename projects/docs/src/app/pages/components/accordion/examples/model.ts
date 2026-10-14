import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  BsAccordion,
  BsAccordionItem,
  BsAccordionHeader,
  BsAccordionBody,
  BsButton,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-accordion-model-example',
  imports: [BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody, BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './model.html',
})
export class AccordionModelExample {
  protected readonly shipping = signal(false);
}
