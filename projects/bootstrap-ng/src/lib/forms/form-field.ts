import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  HostAttributeToken,
  inject,
  input,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { uniqueId } from '../util/id';
import { BsFormFloating } from './floating';

/** What a description element inside a field is: help text, or feedback for one state. */
export type BsFieldDescriptionKind = 'text' | 'invalid' | 'valid';

interface FieldDescription {
  id: Signal<string>;
  kind: BsFieldDescriptionKind;
}

/**
 * Layout wrapper for a form control, its label, description and validation feedback.
 * Bootstrap's CSS grid places checkboxes, radios and switches next to their label.
 *
 * The field also wires up accessibility: a `bsLabel` or `bsFormLabel` inside it gets
 * `for` set to the control's id, and the control's `aria-describedby` lists the
 * `bsFormText` and the feedback that matches its current validation state.
 *
 * ```html
 * <div bsFormField>
 *   <label bsFormLabel>Email address</label>
 *   <input type="email" bsFormControl [formControl]="email" />
 *   <div bsFormText>We’ll never share your email.</div>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsFormField]',
  exportAs: 'bsFormField',
  host: {
    class: 'form-field',
    '[class.form-field-card]': 'card()',
  },
})
export class BsFormField {
  /** Card style that highlights the selected check or radio. */
  readonly card = input(false, { transform: booleanAttribute });

  private readonly controls = signal<Signal<string>[]>([]);
  private readonly descriptions = signal<FieldDescription[]>([]);

  /** Id of the first control in the field, or null when there is none. */
  readonly controlId = computed(() => this.controls()[0]?.() ?? null);

  /** Registers a control. Returns a function that removes it. */
  registerControl(id: Signal<string>): () => void {
    untracked(() => this.controls.update((controls) => [...controls, id]));
    return () =>
      // Compares the signals themselves, to remove this control's entry.
      // eslint-disable-next-line @angular-eslint/no-uncalled-signals
      this.controls.update((controls) => controls.filter((c) => c !== id));
  }

  /** Registers a description element. Returns a function that removes it. */
  registerDescription(id: Signal<string>, kind: BsFieldDescriptionKind): () => void {
    const description = { id, kind };
    untracked(() => this.descriptions.update((items) => [...items, description]));
    return () => this.descriptions.update((items) => items.filter((d) => d !== description));
  }

  /** Ids of the descriptions that apply to a control in the given validation state. */
  describedBy(state: 'valid' | 'invalid' | null): string[] {
    const descriptions = this.descriptions();
    return [
      ...descriptions.filter(({ kind }) => kind === 'text'),
      ...descriptions.filter(({ kind }) => kind === state),
    ].map(({ id }) => id());
  }
}

/**
 * Sets `for` on a `<label>` to the id of the control in the surrounding
 * `bsFormFloating` or `bsFormField`. An explicit `for` attribute wins. Use it for
 * floating labels and for the labels of checkboxes, radios and switches, which
 * Bootstrap styles without a class.
 *
 * ```html
 * <div bsFormField>
 *   <input type="checkbox" bsCheck />
 *   <label bsLabel>Remember me</label>
 * </div>
 * ```
 */
@Directive({
  selector: 'label[bsLabel]',
  host: { '[attr.for]': 'for()' },
})
export class BsLabel {
  private readonly field =
    inject(BsFormFloating, { optional: true }) ?? inject(BsFormField, { optional: true });
  private readonly staticFor = inject(new HostAttributeToken('for'), { optional: true });

  protected readonly for = computed(() => this.staticFor ?? this.field?.controlId() ?? null);
}

/**
 * A `.form-label`, with `for` set like {@link BsLabel}.
 *
 * ```html
 * <label bsFormLabel>Email address</label>
 * ```
 */
@Directive({
  selector: 'label[bsFormLabel]',
  hostDirectives: [BsLabel],
  host: { class: 'form-label' },
})
export class BsFormLabel {}

/** Registers the host element as a description of the surrounding field, if any. */
function describeField(id: Signal<string>, kind: BsFieldDescriptionKind): void {
  const field = inject(BsFormField, { optional: true });
  if (field) {
    inject(DestroyRef).onDestroy(field.registerDescription(id, kind));
  }
}

/**
 * Help text for a control. Inside a `bsFormField`, the control's `aria-describedby`
 * points to it.
 *
 * ```html
 * <div bsFormText>Must be 8-20 characters long.</div>
 * ```
 */
@Directive({
  selector: '[bsFormText]',
  host: { class: 'form-text', '[id]': 'id()' },
})
export class BsFormText {
  /** Element id. Generated when not set. */
  readonly id = input(
    inject(new HostAttributeToken('id'), { optional: true }) ?? uniqueId('bs-text'),
  );

  constructor() {
    describeField(this.id, 'text');
  }
}

/**
 * Feedback shown when the control in the same field is invalid. Bootstrap's CSS shows
 * it for `.is-invalid` controls and, in a `bsValidate` form, for `:user-invalid` ones.
 * Inside a `bsFormField`, it joins the control's `aria-describedby` while the control
 * shows as invalid.
 *
 * ```html
 * <div bsInvalidFeedback>Please enter your name.</div>
 * ```
 */
@Directive({
  selector: '[bsInvalidFeedback]',
  host: {
    '[class]': "tooltip() ? 'tooltip invalid-tooltip' : 'invalid-feedback'",
    '[id]': 'id()',
  },
})
export class BsInvalidFeedback {
  /** Element id. Generated when not set. */
  readonly id = input(
    inject(new HostAttributeToken('id'), { optional: true }) ?? uniqueId('bs-feedback'),
  );
  /** Shows the feedback as a tooltip below the control. */
  readonly tooltip = input(false, { transform: booleanAttribute });

  constructor() {
    describeField(this.id, 'invalid');
  }
}

/**
 * Feedback shown when the control in the same field is valid. Controls only show as
 * valid in a `bsValidate="valid"` form, or with `validation="valid"`.
 *
 * ```html
 * <div bsValidFeedback>Looks good!</div>
 * ```
 */
@Directive({
  selector: '[bsValidFeedback]',
  host: {
    '[class]': "tooltip() ? 'tooltip valid-tooltip' : 'valid-feedback'",
    '[id]': 'id()',
  },
})
export class BsValidFeedback {
  /** Element id. Generated when not set. */
  readonly id = input(
    inject(new HostAttributeToken('id'), { optional: true }) ?? uniqueId('bs-feedback'),
  );
  /** Shows the feedback as a tooltip below the control. */
  readonly tooltip = input(false, { transform: booleanAttribute });

  constructor() {
    describeField(this.id, 'valid');
  }
}
