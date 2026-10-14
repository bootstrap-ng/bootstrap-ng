import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsFormControl, BsFormField, BsFormLabel, BsFormText, BsTypeahead } from 'bootstrap-ng';

const COUNTRIES = [
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'Denmark',
  'Finland',
  'France',
  'Germany',
  'Iceland',
  'India',
  'Ireland',
  'Italy',
  'Japan',
  'Mexico',
  'Netherlands',
  'New Zealand',
  'Norway',
  'Portugal',
  'Spain',
  'Sweden',
  'Switzerland',
  'United Kingdom',
  'United States',
];

@Component({
  selector: 'docs-typeahead-basic-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, BsFormControl, BsFormField, BsFormLabel, BsFormText, BsTypeahead],
  templateUrl: './basic.html',
})
export class TypeaheadBasicExample {
  protected readonly country = new FormControl('');

  protected readonly search = (term: string): string[] =>
    COUNTRIES.filter((country) => country.toLowerCase().includes(term.toLowerCase())).slice(0, 8);
}
