import { Component, signal } from '@angular/core';
import { BsStepper, BsStepperItem, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-stepper-basic-example',
  imports: [BsStepper, BsStepperItem, BsButton],
  templateUrl: './basic.html',
})
export class StepperBasicExample {
  protected readonly step = signal(1);
}
