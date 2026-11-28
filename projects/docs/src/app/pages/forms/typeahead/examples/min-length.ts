import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsFormControl, BsFormField, BsFormLabel, BsFormText, BsTypeahead } from 'bootstrap-ng';

const AIRPORTS = [
  'AMS Amsterdam',
  'CDG Paris',
  'DXB Dubai',
  'FRA Frankfurt',
  'HND Tokyo',
  'JFK New York',
  'LAX Los Angeles',
  'LHR London',
  'MAD Madrid',
  'SFO San Francisco',
  'SIN Singapore',
  'SYD Sydney',
];

@Component({
  selector: 'docs-typeahead-min-length-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, BsFormControl, BsFormField, BsFormLabel, BsFormText, BsTypeahead],
  templateUrl: './min-length.html',
})
export class TypeaheadMinLengthExample {
  protected readonly airport = new FormControl('');

  protected readonly search = (term: string): string[] =>
    AIRPORTS.filter((airport) => airport.toLowerCase().includes(term.toLowerCase()));
}
