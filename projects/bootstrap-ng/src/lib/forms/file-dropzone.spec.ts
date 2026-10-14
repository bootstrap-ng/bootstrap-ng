import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsLiveAnnouncer } from '../util/announcer';
import { BsFileDropzone, BsFileRejection, formatFileSize } from './file-dropzone';
import { BsFormField, BsFormLabel, BsInvalidFeedback } from './form-field';

const file = (name: string, size = 10, type = '') =>
  new File([new Uint8Array(size)], name, { type, lastModified: 1 });

describe('formatFileSize', () => {
  it('formats bytes in the largest fitting unit', () => {
    expect(formatFileSize(512)).toBe('512 bytes');
    expect(formatFileSize(1)).toBe('1 byte');
    expect(formatFileSize(1500)).toBe('1.5 kB');
    expect(formatFileSize(2_000_000)).toBe('2 MB');
    expect(formatFileSize(3e15)).toBe('3,000 TB');
  });
});

describe('BsFileDropzone', () => {
  @Component({
    imports: [ReactiveFormsModule, BsFileDropzone, BsFormField, BsFormLabel, BsInvalidFeedback],
    template: `
      <div bsFormField>
        <label bsFormLabel>Attachments</label>
        <div
          bsFileDropzone
          #dropzone="bsFileDropzone"
          [multiple]="multiple()"
          [accept]="accept()"
          [maxFiles]="maxFiles()"
          [maxFileSize]="maxFileSize()"
          [maxTotalSize]="maxTotalSize()"
          [maxNameLength]="maxNameLength()"
          [formControl]="files"
          (rejected)="rejected = $event"></div>
        <div bsInvalidFeedback>Add a file.</div>
      </div>
    `,
  })
  class Host {
    readonly multiple = signal(true);
    readonly accept = signal('');
    readonly maxFiles = signal<number | null>(null);
    readonly maxFileSize = signal<number | null>(null);
    readonly maxTotalSize = signal<number | null>(null);
    readonly maxNameLength = signal<number | null>(null);
    files = new FormControl<File[]>([], { nonNullable: true, validators: Validators.required });
    rejected: BsFileRejection[] = [];
  }

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const host = root.querySelector<HTMLElement>('[bsFileDropzone]')!;
    const zone = host.querySelector('label')!;
    const input = host.querySelector('input')!;
    const select = async (...files: File[]) => {
      const data = new DataTransfer();
      files.forEach((f) => data.items.add(f));
      input.files = data.files;
      input.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    const items = () =>
      Array.from(host.querySelectorAll('.list-group-item')).map((item) =>
        item.querySelector('.text-truncate')?.textContent?.trim(),
      );
    const errors = () =>
      Array.from(host.querySelectorAll('.fg-danger li')).map((li) => li.textContent?.trim());
    return {
      fixture,
      root,
      host,
      zone,
      input,
      select,
      items,
      errors,
      component: fixture.componentInstance,
    };
  }

  it('renders a labelled native file input inside a dashed zone', async () => {
    const { root, host, zone, input } = await setup();
    expect(host.classList).toContain('d-flex');
    expect(zone.classList).toContain('form-control');
    expect(zone.classList).toContain('p-7');
    expect(zone.style.borderStyle).toBe('dashed');
    expect(input.type).toBe('file');
    expect(input.multiple).toBe(true);
    expect(input.classList).toContain('visually-hidden');
    expect(root.querySelector<HTMLLabelElement>('[bsFormLabel]')!.htmlFor).toBe(input.id);
    expect(zone.textContent).toContain('Drag files here or browse');
  });

  it('adds picked files to the value and lists them', async () => {
    const { select, items, component, input, host } = await setup();
    await select(file('a.txt', 1500));
    await select(file('b.txt'), file('a.txt', 1500));
    expect(component.files.value.map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
    expect(items()).toEqual(['a.txt', 'b.txt']);
    expect(host.querySelector('.list-group-item .fs-sm')?.textContent).toContain('1.5 kB');
    expect(host.querySelector('.list-group')?.getAttribute('aria-label')).toBe('Selected files');
    // The native input holds the whole selection, for native forms.
    expect(Array.from(input.files ?? []).map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
  });

  it('replaces the file without multiple', async () => {
    const { fixture, select, component, errors, zone } = await setup();
    component.multiple.set(false);
    await fixture.whenStable();
    expect(zone.textContent).toContain('Drag a file here');
    await select(file('a.txt'));
    await select(file('b.txt'), file('c.txt'));
    expect(component.files.value.map((f) => f.name)).toEqual(['b.txt']);
    expect(errors()).toEqual(['c.txt wasn’t added: only one file can be added.']);
  });

  it('rejects files that break the limits', async () => {
    const { fixture, select, component, errors, input } = await setup();
    component.accept.set('image/*, .PDF');
    component.maxFileSize.set(100);
    component.maxNameLength.set(8);
    component.maxFiles.set(2);
    component.maxTotalSize.set(150);
    await fixture.whenStable();

    await select(
      file('notes.txt', 10, 'text/plain'),
      file('big.png', 200, 'image/png'),
      file('long-name.pdf', 10),
      file('a.png', 80, 'image/png'),
      file('b.pdf', 80),
      file('c.jpg', 10, 'image/jpeg'),
    );
    expect(component.files.value.map((f) => f.name)).toEqual(['a.png', 'c.jpg']);
    expect(component.rejected.map((r) => [r.file.name, r.reason, r.limit])).toEqual([
      ['notes.txt', 'type', null],
      ['big.png', 'size', 100],
      ['long-name.pdf', 'name-length', 8],
      ['b.pdf', 'total-size', 150],
    ]);
    expect(errors()).toEqual([
      'notes.txt isn’t an accepted file type.',
      'big.png is larger than 100 bytes.',
      'long-name.pdf has a name longer than 8 characters.',
      'b.pdf would take the files over 150 bytes in total.',
    ]);
    expect(Array.from(input.files ?? []).map((f) => f.name)).toEqual(['a.png', 'c.jpg']);

    await select(file('d.png', 1, 'image/png'));
    expect(errors()).toEqual(['d.png wasn’t added: up to 2 files can be added.']);
  });

  it('announces added and rejected files', async () => {
    const { fixture, select, component } = await setup();
    const announce = vi.spyOn(TestBed.inject(BsLiveAnnouncer), 'announce');
    component.accept.set('.txt');
    await fixture.whenStable();
    await select(file('a.txt'));
    expect(announce).toHaveBeenLastCalledWith('Added a.txt.', 'polite');
    await select(file('b.txt'), file('c.png'));
    expect(announce).toHaveBeenLastCalledWith(
      'Added b.txt. c.png isn’t an accepted file type.',
      'assertive',
    );
  });

  it('removes files with their buttons and moves focus to the input', async () => {
    const { select, items, host, input, component, errors } = await setup();
    await select(file('a.txt'), file('b.txt'));
    const remove = host.querySelector<HTMLButtonElement>('.list-group-item button')!;
    expect(remove.classList).toContain('btn-close');
    expect(remove.getAttribute('aria-label')).toBe('Remove a.txt');
    remove.click();
    await vi.waitFor(() => expect(items()).toEqual(['b.txt']));
    expect(component.files.value.map((f) => f.name)).toEqual(['b.txt']);
    expect(document.activeElement).toBe(input);
    expect(errors()).toEqual([]);
  });

  it('shows image previews and releases them', async () => {
    const create = vi.spyOn(URL, 'createObjectURL');
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    const { fixture, select, host } = await setup();
    await select(file('photo.png', 10, 'image/png'), file('doc.txt'));
    const img = host.querySelector('img')!;
    expect(img.src).toMatch(/^blob:/);
    expect(img.alt).toBe('');
    expect(create).toHaveBeenCalledTimes(1);
    expect(host.querySelectorAll('.list-group-item svg')).toHaveLength(1);
    host.querySelector<HTMLButtonElement>('.list-group-item button')!.click();
    await fixture.whenStable();
    expect(revoke).toHaveBeenCalledWith(img.src);
    fixture.destroy();
  });

  it('works with methods and the form control', async () => {
    const { fixture, component, items, host } = await setup();
    const dropzone = fixture.debugElement
      .query((el) => el.nativeElement === host)
      .injector.get(BsFileDropzone);
    component.files.setValue([file('x.txt')]);
    await fixture.whenStable();
    expect(items()).toEqual(['x.txt']);
    expect(dropzone.addFiles([file('y.txt')])).toEqual([]);
    expect(component.files.value).toHaveLength(2);
    dropzone.clear();
    expect(component.files.value).toEqual([]);

    const click = vi.spyOn(host.querySelector('input')!, 'click').mockImplementation(() => {
      // The real file dialog can't open in tests.
    });
    dropzone.open();
    expect(click).toHaveBeenCalled();
  });

  it('shows the invalid state once touched', async () => {
    const { fixture, host, zone, input, root } = await setup();
    expect(host.classList).not.toContain('is-invalid');
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.classList).toContain('is-invalid');
    expect(zone.classList).toContain('is-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(getComputedStyle(root.querySelector('.invalid-feedback')!).display).toBe('block');
  });

  it('is disabled with its form control', async () => {
    const { fixture, component, zone, input, select } = await setup();
    component.files.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(zone.classList).toContain('opacity-50');
    expect(zone.style.cursor).toBe('not-allowed');
    await select(file('a.txt'));
    expect(component.files.value).toEqual([]);
  });

  describe('drag and drop', () => {
    function drag(type: string, data?: DataTransfer | object) {
      const event = new DragEvent(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'dataTransfer', { value: data ?? new DataTransfer() });
      return event;
    }

    it('highlights the zone while files are dragged over it', async () => {
      const { fixture, zone } = await setup();
      const child = zone.querySelector('span')!;
      zone.dispatchEvent(drag('dragenter'));
      child.dispatchEvent(drag('dragenter'));
      const over = drag('dragover', { dropEffect: 'none' });
      zone.dispatchEvent(over);
      expect(over.defaultPrevented).toBe(true);
      expect(over.dataTransfer?.dropEffect).toBe('copy');
      child.dispatchEvent(drag('dragleave'));
      await fixture.whenStable();
      expect(zone.classList).toContain('border-primary');
      expect(zone.classList).toContain('bg-subtle-primary');
      expect(zone.textContent).toContain('Drop to add files');
      zone.dispatchEvent(drag('dragleave'));
      await fixture.whenStable();
      expect(zone.classList).not.toContain('border-primary');
    });

    it('adds dropped files', async () => {
      const { fixture, zone, component } = await setup();
      const data = new DataTransfer();
      data.items.add(file('a.txt'));
      zone.dispatchEvent(drag('dragenter'));
      const drop = drag('drop', data);
      zone.dispatchEvent(drop);
      expect(drop.defaultPrevented).toBe(true);
      await vi.waitFor(() => expect(component.files.value.map((f) => f.name)).toEqual(['a.txt']));
      await fixture.whenStable();
      expect(component.files.touched).toBe(true);
      expect(zone.classList).not.toContain('border-primary');
    });

    it('reads the files in dropped folders', async () => {
      const { zone, component } = await setup();
      const fileEntry = (f: File) => ({
        isFile: true,
        isDirectory: false,
        file: (resolve: (f: File) => void) => resolve(f),
      });
      const folder = (children: object[]) => {
        const batches = [children, []];
        return {
          isFile: false,
          isDirectory: true,
          createReader: () => ({
            readEntries: (resolve: (entries: object[]) => void) => resolve(batches.shift() ?? []),
          }),
        };
      };
      const loose = file('loose.txt');
      const data = {
        files: [],
        items: [
          {
            kind: 'file',
            getAsFile: () => null,
            webkitGetAsEntry: () =>
              folder([fileEntry(file('a.txt')), folder([fileEntry(file('b.txt'))])]),
          },
          { kind: 'file', getAsFile: () => loose, webkitGetAsEntry: () => null },
          { kind: 'string', getAsFile: () => null, webkitGetAsEntry: () => null },
        ],
      };
      zone.dispatchEvent(drag('drop', data));
      await vi.waitFor(() =>
        expect(component.files.value.map((f) => f.name)).toEqual(['a.txt', 'b.txt', 'loose.txt']),
      );
    });

    it('ignores drops while disabled', async () => {
      const { fixture, zone, component } = await setup();
      component.files.disable();
      await fixture.whenStable();
      zone.dispatchEvent(drag('dragenter'));
      const over = drag('dragover', { dropEffect: 'copy' });
      zone.dispatchEvent(over);
      expect(over.dataTransfer?.dropEffect).toBe('none');
      await fixture.whenStable();
      expect(zone.classList).not.toContain('border-primary');
      const data = new DataTransfer();
      data.items.add(file('a.txt'));
      zone.dispatchEvent(drag('drop', data));
      await fixture.whenStable();
      expect(component.files.value).toEqual([]);
    });
  });

  it('supports custom content, sizes and texts with [(value)]', async () => {
    @Component({
      imports: [BsFileDropzone],
      template: `
        <div
          bsFileDropzone
          aria-label="Upload"
          size="lg"
          removeLabel="Delete"
          [thumbnails]="false"
          [fileList]="list()"
          [formatSize]="format"
          [rejectionText]="reject"
          maxFileSize="5"
          [(value)]="files">
          <span>Custom content</span>
        </div>
      `,
    })
    class CustomHost {
      readonly list = signal(true);
      readonly files = signal<File[]>([file('a.png', 1, 'image/png')]);
      readonly format = (bytes: number) => `${String(bytes)} B`;
      readonly reject = (r: BsFileRejection) => `No: ${r.file.name}`;
    }
    const fixture = TestBed.createComponent(CustomHost);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('[bsFileDropzone]');
    const input = host.querySelector('input')!;
    expect(host.hasAttribute('aria-label')).toBe(false);
    expect(input.getAttribute('aria-label')).toBe('Upload');
    expect(input.multiple).toBe(false);
    expect(host.querySelector('label')!.classList).toContain('p-10');
    expect(host.querySelector('label')!.textContent?.trim()).toBe('Custom content');
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('.list-group .fs-sm')?.textContent).toBe('1 B');
    expect(host.querySelector('button')!.getAttribute('aria-label')).toBe('Delete a.png');

    const data = new DataTransfer();
    data.items.add(file('big.txt', 10));
    input.files = data.files;
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(host.querySelector('.fg-danger li')?.textContent).toBe('No: big.txt');
    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['a.png']);

    fixture.componentInstance.list.set(false);
    await fixture.whenStable();
    expect(host.querySelector('.list-group')).toBeNull();
  });
});
