import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  LOCALE_ID,
  model,
  numberAttribute,
  output,
  Provider,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BsCloseButton } from 'bootstrap-ng/close-button';
import { BsLiveAnnouncer, configToken, provideConfig } from 'bootstrap-ng/util';
import { BS_CONTROL_HOST, BsControl, BsValueControl } from 'bootstrap-ng/forms';

/** Size of a file dropzone. */
export type BsFileDropzoneSize = 'sm' | 'md' | 'lg';

/** Why a `bsFileDropzone` didn't add a file. */
export type BsFileRejectionReason = 'type' | 'size' | 'total-size' | 'count' | 'name-length';

/** A file a `bsFileDropzone` didn't add, and why. */
export interface BsFileRejection {
  file: File;
  reason: BsFileRejectionReason;
  /** The limit the file broke: bytes, a number of files or characters. `null` for `type`. */
  limit: number | null;
}

const SIZES: Record<BsFileDropzoneSize, string> = { sm: 'p-4', md: 'p-7', lg: 'p-10' };
const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

/** Formats a number of bytes, such as “1.5 MB”, in the given locale. */
export function formatFileSize(bytes: number, locale = 'en-US'): string {
  let size = bytes;
  let unit = 0;
  while (size >= 1000 && unit < UNITS.length - 1) {
    size /= 1000;
    unit++;
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: UNITS[unit],
    // “70 bytes”, but “1.5 kB”: the short form of byte is “byte” in English.
    unitDisplay: unit ? 'short' : 'long',
    maximumFractionDigits: unit ? 1 : 0,
  }).format(size);
}

const optionalNumber = (value: unknown): number | null =>
  value === null || value === undefined || value === '' ? null : numberAttribute(value);

/** Whether `file` matches an `accept` list such as `image/*,.pdf`. */
function accepts(file: File, accept: string): boolean {
  const types = accept
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return (
    !types.length ||
    types.some((type) =>
      type.startsWith('.')
        ? name.endsWith(type)
        : type.endsWith('/*')
          ? mime.startsWith(type.slice(0, -1))
          : mime === type,
    )
  );
}

const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/** Reads every file in a dropped folder, including its subfolders. */
async function readEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return [
      await new Promise<File>((resolve, reject) => {
        (entry as FileSystemFileEntry).file(resolve, reject);
      }),
    ];
  }
  const reader = (entry as FileSystemDirectoryEntry).createReader();
  const children: FileSystemEntry[] = [];
  // readEntries returns the entries in batches, and an empty batch at the end.
  for (;;) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });
    if (!batch.length) {
      break;
    }
    children.push(...batch);
  }
  return (await Promise.all(children.map(readEntry))).flat();
}

/**
 * The files of a drop. Folders are read in full. Their entries have to be taken while the
 * drop event is being handled, so call this synchronously from the handler.
 */
function droppedFiles(data: DataTransfer): Promise<File[]> {
  const items = Array.from(data.items).filter((item) => item.kind === 'file');
  const entries = items.map((item) => item.webkitGetAsEntry());
  if (!entries.some((entry) => entry?.isDirectory)) {
    return Promise.resolve(Array.from(data.files));
  }
  const files = items.map((item) => item.getAsFile());
  return Promise.all(
    entries.map((entry, i) => {
      const file = files[i];
      return entry ? readEntry(entry) : Promise.resolve(file ? [file] : []);
    }),
  ).then((lists) => lists.flat());
}

/** Defaults for the inputs of file dropzones. Inputs set on a component win over them. */
export interface BsFileDropzoneConfig {
  /** Maximum size of each file in bytes, or `null` for no limit. */
  maxFileSize: number | null;
  /** Lists the selected files under the zone. */
  fileList: boolean;
  /** Shows a preview of selected images in the file list. */
  thumbnails: boolean;
  /** Padding of the zone. */
  size: BsFileDropzoneSize;
  /** Start of the remove buttons’ accessible names, followed by the file name. */
  removeLabel: string;
  /** Accessible name of the file list. */
  fileListLabel: string;
  /** Formats a file size. Override it to change units or translate. */
  formatSize: (bytes: number) => string;
  /** Text shown and announced for a file that wasn’t added. Override it to translate. */
  rejectionText: (rejection: BsFileRejection) => string;
}

/** The defaults set with `provideBsFileDropzoneConfig()`. */
export const BS_FILE_DROPZONE_CONFIG = configToken<BsFileDropzoneConfig>('BS_FILE_DROPZONE_CONFIG');

/**
 * Sets defaults for the inputs of file dropzones, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsFileDropzoneConfig({ maxFileSize: 10_000_000, removeLabel: 'Retirer' })]
 * ```
 */
export function provideBsFileDropzoneConfig(config: Partial<BsFileDropzoneConfig>): Provider {
  return provideConfig(BS_FILE_DROPZONE_CONFIG, config);
}

/**
 * A drop zone for picking files by drag and drop or the browser’s file dialog. It is built
 * on a native `<input type="file">`, so it is one tab stop and Enter or Space opens the
 * dialog. The value is a `File[]`: bind it with `[formControl]`, `[(ngModel)]`,
 * `[formField]` or `[(value)]`.
 *
 * Files that don’t match `accept` or break a limit (`maxFiles`, `maxFileSize`,
 * `maxTotalSize`, `maxNameLength`) are left out, listed under the zone and announced to
 * screen readers, and `rejected` emits them. Selected files are listed with their size, an
 * image preview and a remove button. Dropping a folder adds the files inside it.
 *
 * ```html
 * <div bsFormField>
 *   <label bsFormLabel>Attachments</label>
 *   <div bsFileDropzone multiple accept="image/*,.pdf" [formControl]="files"></div>
 * </div>
 * ```
 */
@Component({
  selector: 'div[bsFileDropzone]',
  exportAs: 'bsFileDropzone',
  imports: [BsControl, BsCloseButton],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BsFileDropzone), multi: true },
  ],
  viewProviders: [{ provide: BS_CONTROL_HOST, useExisting: forwardRef(() => BsFileDropzone) }],
  template: `
    <label
      class="form-control flex-column align-items-center justify-content-center gap-2 text-center mb-0"
      [class]="zoneClasses()"
      [style.border-style]="'dashed'"
      [style.cursor]="isDisabled() ? 'not-allowed' : 'pointer'"
      (dragenter)="onDragEnter($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)">
      <input
        #input
        type="file"
        bsControl
        class="visually-hidden"
        [validation]="validation()"
        [attr.aria-label]="ariaLabel()"
        [attr.name]="name()"
        [attr.capture]="capture()"
        [multiple]="multiple()"
        [accept]="accept()"
        [required]="required()"
        [disabled]="isDisabled()"
        (change)="onSelect()"
        (blur)="markTouched()" />
      <ng-content>
        <svg
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class="fs-3xl fg-3">
          <path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        @if (isDragging()) {
          <span class="fw-semibold">Drop to add {{ multiple() ? 'files' : 'the file' }}</span>
        } @else {
          <span>
            <span class="fw-semibold">Drag {{ multiple() ? 'files' : 'a file' }} here</span>
            or <span class="fg-primary text-decoration-underline">browse</span>
          </span>
        }
      </ng-content>
    </label>
    @if (rejections().length) {
      <ul class="list-unstyled fs-sm fg-danger mb-0">
        @for (rejection of rejections(); track $index) {
          <li>{{ rejectionText()(rejection) }}</li>
        }
      </ul>
    }
    @if (fileList() && value().length) {
      <ul class="list-group" [attr.aria-label]="fileListLabel()">
        @for (file of value(); track file) {
          <li class="list-group-item d-flex align-items-center gap-3">
            @if (preview(file); as url) {
              <!-- eslint-disable @angular-eslint/template/prefer-ngsrc -- object URLs of picked files, not static images -->
              <img
                [src]="url"
                alt=""
                width="40"
                height="40"
                class="flex-shrink-0 rounded-3 object-fit-cover" />
              <!-- eslint-enable @angular-eslint/template/prefer-ngsrc -->
            } @else {
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linejoin="round"
                aria-hidden="true"
                class="flex-shrink-0 fg-3">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
              </svg>
            }
            <div class="flex-grow-1 min-w-0">
              <div class="text-truncate">{{ file.name }}</div>
              <div class="fs-sm fg-3">{{ formatSize()(file.size) }}</div>
            </div>
            <button
              bsCloseButton
              class="flex-shrink-0"
              [style.min-width.rem]="1.5"
              [style.min-height.rem]="1.5"
              [aria-label]="removeLabel() + ' ' + file.name"
              [disabled]="isDisabled()"
              (click)="remove(file)"></button>
          </li>
        }
      </ul>
    }
  `,
  host: {
    class: 'd-flex flex-column gap-3',
    '[class.is-valid]': "state() === 'valid'",
    '[class.is-invalid]': "state() === 'invalid'",
    '[attr.aria-label]': 'null',
  },
})
export class BsFileDropzone extends BsValueControl<File[]> {
  private readonly config = inject(BS_FILE_DROPZONE_CONFIG);
  private readonly announcer = inject(BsLiveAnnouncer);
  private readonly locale = inject(LOCALE_ID);

  /** The selected files. Supports two-way binding with `[(value)]`. */
  readonly value = model<File[]>([]);
  protected readonly emptyValue: File[] = [];

  /** Allows more than one file. Without it, a new file replaces the selected one. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Accepted file types, like the native `accept`: MIME types, `image/*` or extensions. */
  readonly accept = input('');
  /** Maximum number of files, or `null` for no limit. */
  readonly maxFiles = input<number | null, unknown>(null, { transform: optionalNumber });
  /** Maximum size of each file in bytes, or `null` for no limit. */
  readonly maxFileSize = input<number | null, unknown>(this.config.maxFileSize ?? null, {
    transform: optionalNumber,
  });
  /** Maximum size of all files together in bytes, or `null` for no limit. */
  readonly maxTotalSize = input<number | null, unknown>(null, { transform: optionalNumber });
  /** Maximum length of a file name in characters, or `null` for no limit. */
  readonly maxNameLength = input<number | null, unknown>(null, { transform: optionalNumber });
  /** Makes a file required, for native constraint validation in a `bsValidate` form. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Name of the native input, so a native `<form>` submits the files. */
  readonly name = input<string | null>(null);
  /** Camera to use on mobile devices, like the native `capture` attribute. */
  readonly capture = input<'user' | 'environment' | null>(null);
  /** Lists the selected files under the zone. */
  readonly fileList = input(this.config.fileList ?? true, { transform: booleanAttribute });
  /** Shows a preview of selected images in the file list. */
  readonly thumbnails = input(this.config.thumbnails ?? true, { transform: booleanAttribute });
  /** Padding of the zone. */
  readonly size = input<BsFileDropzoneSize>(this.config.size ?? 'md');
  /** Accessible name of the input, when it has no visible label. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  /** Validation styles of the zone. See `BsControl`. */
  readonly validation = input<'auto' | 'valid' | 'invalid' | 'none'>('auto');
  /** Start of the remove buttons’ accessible names, followed by the file name. */
  readonly removeLabel = input(this.config.removeLabel ?? 'Remove');
  /** Accessible name of the file list. */
  readonly fileListLabel = input(this.config.fileListLabel ?? 'Selected files');
  /** Formats a file size. Override it to change units or translate. */
  readonly formatSize = input<(bytes: number) => string>(
    this.config.formatSize ?? ((bytes) => formatFileSize(bytes, this.locale)),
  );
  /** Text shown and announced for a file that wasn’t added. Override it to translate. */
  readonly rejectionText = input<(rejection: BsFileRejection) => string>(
    this.config.rejectionText ?? ((rejection) => this.defaultRejectionText(rejection)),
  );

  /** Emits the files that were left out of a selection or drop, and why. */
  readonly rejected = output<BsFileRejection[]>();

  /** Whether files are being dragged over the zone. */
  readonly isDragging = signal(false);
  /** Files left out of the last selection or drop. */
  readonly rejections = signal<readonly BsFileRejection[]>([]);

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly control = viewChild(BsControl);
  private readonly previews = new Map<File, string>();
  private dragDepth = 0;

  protected readonly state = computed(() => this.control()?.state() ?? null);
  protected readonly zoneClasses = computed(() =>
    [
      SIZES[this.size()],
      this.isDragging() ? 'border-primary bg-subtle-primary' : '',
      this.isDisabled() ? 'opacity-50' : '',
      this.state() === 'valid' ? 'is-valid' : '',
      this.state() === 'invalid' ? 'is-invalid' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    super();
    // Keep the native input's files in step, so native forms and validation see them.
    afterRenderEffect(() => {
      this.syncInput(this.value());
    });
    // Release the previews of files that were removed.
    effect(() => {
      const files = this.value();
      for (const [file, url] of this.previews) {
        if (!files.includes(file)) {
          URL.revokeObjectURL(url);
          this.previews.delete(file);
        }
      }
    });
    inject(DestroyRef).onDestroy(() => {
      for (const url of this.previews.values()) {
        URL.revokeObjectURL(url);
      }
    });
  }

  /**
   * Adds files as if they were dropped: files that don't match `accept`, break a limit or
   * are already selected are left out. Returns the rejected files.
   */
  addFiles(files: Iterable<File>): BsFileRejection[] {
    if (this.isDisabled()) {
      return [];
    }
    const multiple = this.multiple();
    const selected = multiple ? [...this.value()] : [];
    const maxFiles = multiple ? (this.maxFiles() ?? Infinity) : 1;
    const maxFileSize = this.maxFileSize();
    const maxTotalSize = this.maxTotalSize();
    const maxNameLength = this.maxNameLength();
    let total = selected.reduce((sum, file) => sum + file.size, 0);
    const added: File[] = [];
    const rejected: BsFileRejection[] = [];
    const reject = (file: File, reason: BsFileRejectionReason, limit: number | null) =>
      rejected.push({ file, reason, limit });

    for (const file of files) {
      if (selected.some((other) => sameFile(other, file))) {
        continue;
      }
      if (!accepts(file, this.accept())) {
        reject(file, 'type', null);
      } else if (maxFileSize !== null && file.size > maxFileSize) {
        reject(file, 'size', maxFileSize);
      } else if (maxNameLength !== null && file.name.length > maxNameLength) {
        reject(file, 'name-length', maxNameLength);
      } else if (selected.length >= maxFiles) {
        reject(file, 'count', maxFiles);
      } else if (maxTotalSize !== null && total + file.size > maxTotalSize) {
        reject(file, 'total-size', maxTotalSize);
      } else {
        selected.push(file);
        added.push(file);
        total += file.size;
      }
    }

    if (added.length) {
      this.updateValue(selected);
    }
    this.rejections.set(rejected);
    const messages = rejected.map((rejection) => this.rejectionText()(rejection));
    if (added.length) {
      messages.unshift(`Added ${added.map((file) => file.name).join(', ')}.`);
    }
    if (messages.length) {
      this.announcer.announce(messages.join(' '), rejected.length ? 'assertive' : 'polite');
    }
    if (rejected.length) {
      this.rejected.emit(rejected);
    }
    return rejected;
  }

  /** Removes a selected file. */
  remove(file: File): void {
    const files = this.value();
    const index = files.indexOf(file);
    if (index === -1 || this.isDisabled()) {
      return;
    }
    this.updateValue(files.filter((other) => other !== file));
    this.rejections.set([]);
    this.announcer.announce(`Removed ${file.name}.`);
    // The remove button goes away with the file, so keep focus in the control.
    this.focus();
  }

  /** Removes every file and clears the rejection messages. */
  clear(): void {
    this.updateValue([]);
    this.rejections.set([]);
  }

  /** Opens the browser’s file dialog. */
  open(): void {
    this.input().nativeElement.click();
  }

  /** Focuses the input. */
  focus(): void {
    this.input().nativeElement.focus();
  }

  /** An object URL showing `file`, for image previews. */
  protected preview(file: File): string | null {
    if (!this.thumbnails() || !file.type.startsWith('image/')) {
      return null;
    }
    let url = this.previews.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      this.previews.set(file, url);
    }
    return url;
  }

  protected onSelect(): void {
    this.addFiles(Array.from(this.input().nativeElement.files ?? []));
    // Rejected files stay out of the native input too.
    this.syncInput(this.value());
  }

  protected onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth++;
    this.isDragging.set(!this.isDisabled());
  }

  protected onDragOver(event: DragEvent): void {
    // Without preventDefault the browser opens the dropped file instead.
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.isDisabled() ? 'none' : 'copy';
    }
  }

  protected onDragLeave(): void {
    // Moving between the zone's children also fires dragleave, so count the levels.
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (!this.dragDepth) {
      this.isDragging.set(false);
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = 0;
    this.isDragging.set(false);
    if (!event.dataTransfer || this.isDisabled()) {
      return;
    }
    void droppedFiles(event.dataTransfer).then((files) => {
      this.addFiles(files);
      this.markTouched();
    });
  }

  private syncInput(files: File[]): void {
    const input = this.input().nativeElement;
    try {
      const data = new DataTransfer();
      for (const file of files) {
        data.items.add(file);
      }
      input.files = data.files;
    } catch {
      // Browsers without a DataTransfer constructor can only clear the input.
      input.value = '';
    }
  }

  private defaultRejectionText({ file, reason, limit }: BsFileRejection): string {
    const name = file.name;
    const count = limit ?? 0;
    switch (reason) {
      case 'type':
        return `${name} isn’t an accepted file type.`;
      case 'size':
        return `${name} is larger than ${this.formatSize()(count)}.`;
      case 'total-size':
        return `${name} would take the files over ${this.formatSize()(count)} in total.`;
      case 'count':
        return count === 1
          ? `${name} wasn’t added: only one file can be added.`
          : `${name} wasn’t added: up to ${String(count)} files can be added.`;
      case 'name-length':
        return `${name} has a name longer than ${String(count)} characters.`;
    }
  }
}
