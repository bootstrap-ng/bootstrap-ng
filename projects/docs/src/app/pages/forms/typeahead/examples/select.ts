import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BsBadge, BsFormControl, BsFormField, BsFormLabel, BsTypeahead } from 'bootstrap-ng';

const PEOPLE = [
  'Ada Lovelace',
  'Alan Turing',
  'Barbara Liskov',
  'Donald Knuth',
  'Edsger Dijkstra',
  'Grace Hopper',
  'Katherine Johnson',
  'Linus Torvalds',
  'Margaret Hamilton',
  'Tim Berners-Lee',
];

@Component({
  selector: 'docs-typeahead-select-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BsBadge, BsFormControl, BsFormField, BsFormLabel, BsTypeahead],
  templateUrl: './select.html',
})
export class TypeaheadSelectExample {
  protected readonly team = signal<string[]>([]);

  /** Leaves out people who are already on the team. */
  protected readonly search = (term: string): string[] =>
    PEOPLE.filter(
      (person) =>
        !this.team().includes(person) && person.toLowerCase().includes(term.toLowerCase()),
    );

  protected add(person: string): void {
    this.team.update((team) => [...team, person]);
  }
}
