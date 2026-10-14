import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { FileDropzoneBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { FileDropzoneLimitsExample } from './examples/limits';
import limitsHtml from './examples/limits.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import limitsTs from './examples/limits.ts' with { loader: 'text' };
import { FileDropzoneSingleExample } from './examples/single';
import singleHtml from './examples/single.html' with { loader: 'text' };
import { FileDropzoneSizesExample } from './examples/sizes';
import sizesHtml from './examples/sizes.html' with { loader: 'text' };
import { FileDropzoneCustomExample } from './examples/custom';
import customHtml from './examples/custom.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import customTs from './examples/custom.ts' with { loader: 'text' };
import { FileDropzoneDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
import { FileDropzoneFormsExample } from './examples/forms';
import formsHtml from './examples/forms.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import formsTs from './examples/forms.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'File dropzone',
  lead: 'Drag-and-drop file upload built on a native file input, with type and size limits, image previews and a removable file list.',
  sections: [
    {
      id: 'how-it-works',
      title: 'How it works',
      description:
        'A <code>bsFileDropzone</code> wraps a visually hidden <code>&lt;input type="file"&gt;</code>, so it is one tab stop: Enter or Space opens the file dialog, and so does a click anywhere in the zone. Files can also be dropped on it, folders included. Selected files are listed under the zone with their size and a remove button, and additions are announced to screen readers. Its value is a <code>File[]</code>; bind it with <code>[(value)]</code>, <code>[formControl]</code>, <code>[(ngModel)]</code> or <code>[formField]</code>. Set <code>multiple</code> to keep adding files.',
      example: FileDropzoneBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'limits',
      title: 'File types and limits',
      description:
        'Set <code>accept</code> like the native attribute, with MIME types, wildcards such as <code>image/*</code> or extensions. Dropped files are checked against it too. <code>maxFiles</code>, <code>maxFileSize</code> and <code>maxTotalSize</code> (in bytes) and <code>maxNameLength</code> limit the selection. Files that don’t fit are left out, explained under the zone and announced, and <code>(rejected)</code> emits them with the reason. Images get a preview; set <code>[thumbnails]="false"</code> to show a file icon instead.',
      example: FileDropzoneLimitsExample,
      html: limitsHtml,
      ts: limitsTs,
    },
    {
      id: 'single-file',
      title: 'Single file',
      description:
        'Without <code>multiple</code>, the dropzone holds one file and a new one replaces it.',
      example: FileDropzoneSingleExample,
      html: singleHtml,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description:
        'Set <code>size</code> to <code>sm</code> or <code>lg</code> to change the padding.',
      example: FileDropzoneSizesExample,
      html: sizesHtml,
    },
    {
      id: 'custom-content',
      title: 'Custom content and file list',
      description:
        'Content inside the dropzone replaces its icon and text. Export it with <code>#dropzone="bsFileDropzone"</code> to read <code>isDragging()</code> or call <code>remove()</code>, <code>clear()</code> and <code>open()</code>. Set <code>[fileList]="false"</code> to render the files yourself.',
      example: FileDropzoneCustomExample,
      html: customHtml,
      ts: customTs,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description:
        'Disable the dropzone, or its form control. It leaves the tab order and ignores drops.',
      example: FileDropzoneDisabledExample,
      html: disabledHtml,
    },
    {
      id: 'with-forms',
      title: 'With forms',
      description:
        'In a <code>bsFormField</code>, the label points to the file input, the help text describes it, and the zone turns red with its feedback once it is touched and invalid. <code>Validators.required</code> fails while no file is selected. The native input always holds the selected files, so with <code>name</code> a plain <code>&lt;form&gt;</code> can submit them, and <code>required</code> works with native validation in a <code>bsValidate</code> form.',
      example: FileDropzoneFormsExample,
      html: formsHtml,
      ts: formsTs,
    },
  ],
  api: [
    {
      name: 'BsFileDropzone',
      selector: 'div[bsFileDropzone]',
      exportAs: 'bsFileDropzone',
      inputs: [
        {
          name: 'value',
          type: 'File[]',
          default: '[]',
          description: 'The selected files. Supports [(value)].',
        },
        {
          name: 'multiple',
          type: 'boolean',
          default: 'false',
          description:
            'Allows more than one file. Without it, a new file replaces the selected one.',
        },
        {
          name: 'accept',
          type: 'string',
          default: "''",
          description: 'Accepted file types: MIME types, wildcards such as image/* or extensions.',
        },
        {
          name: 'maxFiles',
          type: 'number | null',
          default: 'null',
          description: 'Maximum number of files.',
        },
        {
          name: 'maxFileSize',
          type: 'number | null',
          default: 'null',
          description: 'Maximum size of each file, in bytes.',
        },
        {
          name: 'maxTotalSize',
          type: 'number | null',
          default: 'null',
          description: 'Maximum size of all files together, in bytes.',
        },
        {
          name: 'maxNameLength',
          type: 'number | null',
          default: 'null',
          description: 'Maximum length of a file name, in characters.',
        },
        {
          name: 'required',
          type: 'boolean',
          default: 'false',
          description: 'Sets required on the native input, for native validation.',
        },
        {
          name: 'name',
          type: 'string | null',
          default: 'null',
          description: 'Name of the native input, so a native form submits the files.',
        },
        {
          name: 'capture',
          type: "'user' | 'environment' | null",
          default: 'null',
          description: 'Camera to use on mobile devices.',
        },
        {
          name: 'fileList',
          type: 'boolean',
          default: 'true',
          description: 'Lists the selected files under the zone.',
        },
        {
          name: 'thumbnails',
          type: 'boolean',
          default: 'true',
          description: 'Shows a preview of selected images in the file list.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Padding of the zone.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables the dropzone. Forms set this through disable().',
        },
        {
          name: 'aria-label',
          type: 'string | null',
          default: 'null',
          description: 'Accessible name of the input, when it has no visible label.',
        },
        {
          name: 'removeLabel',
          type: 'string',
          default: "'Remove'",
          description: 'Start of the remove buttons’ accessible names, followed by the file name.',
        },
        {
          name: 'fileListLabel',
          type: 'string',
          default: "'Selected files'",
          description: 'Accessible name of the file list.',
        },
        {
          name: 'formatSize',
          type: '(bytes: number) => string',
          default: '“1.5 MB”',
          description: 'Formats file sizes in the file list and messages.',
        },
        {
          name: 'rejectionText',
          type: '(rejection: BsFileRejection) => string',
          default: '“a.txt isn’t an accepted file type.”',
          description: 'Text shown and announced for a file that wasn’t added.',
        },
        {
          name: 'validation',
          type: "'auto' | 'valid' | 'invalid' | 'none'",
          default: "'auto'",
          description: 'Validation styles. auto follows the bound Angular form control.',
        },
      ],
      outputs: [
        {
          name: 'valueChange',
          type: 'File[]',
          description: 'Emits the files when they change.',
        },
        {
          name: 'rejected',
          type: 'BsFileRejection[]',
          description:
            'Emits the files left out of a selection or drop, with a reason (type, size, total-size, count or name-length) and the limit.',
        },
      ],
      methods: [
        {
          name: 'addFiles(files)',
          type: 'BsFileRejection[]',
          description: 'Adds files as if they were dropped, and returns the rejected ones.',
        },
        { name: 'remove(file)', type: 'void', description: 'Removes a selected file.' },
        {
          name: 'clear()',
          type: 'void',
          description: 'Removes every file and clears the messages.',
        },
        { name: 'open()', type: 'void', description: 'Opens the browser’s file dialog.' },
        { name: 'focus()', type: 'void', description: 'Focuses the input.' },
        {
          name: 'isDragging()',
          type: 'boolean',
          description: 'Whether files are being dragged over the zone.',
        },
        {
          name: 'rejections()',
          type: 'readonly BsFileRejection[]',
          description: 'Files left out of the last selection or drop.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-file-dropzone-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class FileDropzonePage {
  protected readonly page = PAGE;
}
