import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { TableBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { TableVariantsExample } from './examples/variants';
import variantsHtml from './examples/variants.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import variantsTs from './examples/variants.ts' with { loader: 'text' };
import { TableSortingExample } from './examples/sorting';
import sortingHtml from './examples/sorting.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import sortingTs from './examples/sorting.ts' with { loader: 'text' };
import { TablePagingExample } from './examples/paging';
import pagingHtml from './examples/paging.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import pagingTs from './examples/paging.ts' with { loader: 'text' };
import { TableSelectionExample } from './examples/selection';
import selectionHtml from './examples/selection.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import selectionTs from './examples/selection.ts' with { loader: 'text' };
import { TableCellsExample } from './examples/cells';
import cellsHtml from './examples/cells.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import cellsTs from './examples/cells.ts' with { loader: 'text' };
import { TableDetailExample } from './examples/detail';
import detailHtml from './examples/detail.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import detailTs from './examples/detail.ts' with { loader: 'text' };
import { TableColumnsExample } from './examples/columns';
import columnsHtml from './examples/columns.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import columnsTs from './examples/columns.ts' with { loader: 'text' };
import { TableStickyExample } from './examples/sticky';
import stickyHtml from './examples/sticky.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import stickyTs from './examples/sticky.ts' with { loader: 'text' };
import { TableStatesExample } from './examples/states';
import statesHtml from './examples/states.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import statesTs from './examples/states.ts' with { loader: 'text' };
import { TableServerExample } from './examples/server';
import serverHtml from './examples/server.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import serverTs from './examples/server.ts' with { loader: 'text' };
import { TableStackedExample } from './examples/stacked';
import stackedHtml from './examples/stacked.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import stackedTs from './examples/stacked.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Table',
  lead: 'Data tables on Bootstrap’s table styles, with sorting, search, pagination, row selection, expandable rows and resizable, reorderable columns.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/content/tables/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Give <code>table[bsTable]</code> its rows with <code>data</code> and column definitions with <code>[(columns)]</code>. Each column shows <code>row[key]</code> unless it has a <code>value</code> function, and <code>format</code> turns the value into text. Add a <code>&lt;caption&gt;</code> so screen reader users know what the table holds.',
      example: TableBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'variants',
      title: 'Variants',
      description:
        'Bootstrap’s table styles are inputs: <code>striped</code>, <code>hover</code>, <code>bordered</code>, <code>borderless</code>, <code>size="sm"</code> for a denser table, and <code>theme</code> for a colored one. You can also add other Bootstrap classes, such as <code>align-middle</code>, to the <code>&lt;table&gt;</code> itself.',
      example: TableVariantsExample,
      html: variantsHtml,
      ts: variantsTs,
    },
    {
      id: 'sorting',
      title: 'Sorting',
      description:
        'Mark columns <code>sortable</code> to put a sort button in their header. Each click cycles through ascending, descending and unsorted, and the header gets <code>aria-sort</code>. Bind the state with <code>[(sort)]</code>. Numbers, dates and text (with natural number order) sort as you’d expect and empty values go last; set a column’s <code>compare</code> for anything else.',
      example: TableSortingExample,
      html: sortingHtml,
      ts: sortingTs,
    },
    {
      id: 'search-and-pagination',
      title: 'Search and pagination',
      description:
        'Bind your own search field to <code>filter</code>: rows match when the text of any visible column contains it, ignoring case. Set <code>filterFn</code> for custom matching, or <code>filterable: false</code> on a column to skip it. Set <code>pageSize</code> and bind <code>[(page)]</code>, then wire a <code>bsPagination</code> to the table’s <code>pageCount()</code> and <code>currentPage()</code>, which stays in range when the filter leaves fewer pages.',
      example: TablePagingExample,
      html: pagingHtml,
      ts: pagingTs,
    },
    {
      id: 'selection',
      title: 'Row selection',
      description:
        'Set <code>selection</code> to <code>multiple</code> for a checkbox column with a select-all checkbox in the header (it selects the rows on the current page), or to <code>single</code> for radios. Selected rows get <code>.table-active</code>. Bind <code>[(selected)]</code>, and set <code>rowKey</code> when rows are recreated, for example after a reload, so selection survives. Each checkbox is labelled with the row’s first column; change that with <code>rowLabel</code>.',
      example: TableSelectionExample,
      html: selectionHtml,
      ts: selectionTs,
    },
    {
      id: 'custom-cells',
      title: 'Custom cells',
      description:
        'Put an <code>ng-template bsTableCell="key"</code> inside the table to render a column’s cells yourself, such as badges, links or action buttons. The template gets the row, plus <code>value</code>, <code>column</code> and <code>index</code>. Add <code>[bsTableCellOf]="rows"</code> so strict templates know the row’s type.',
      example: TableCellsExample,
      html: cellsHtml,
      ts: cellsTs,
    },
    {
      id: 'expandable-rows',
      title: 'Expandable rows',
      description:
        'Add an <code>ng-template bsTableDetail</code> to give each row a toggle button that shows the template in a full-width row underneath. The button has <code>aria-expanded</code>, and <code>aria-controls</code> while the row is open. Bind <code>[(expanded)]</code> to open rows from code.',
      example: TableDetailExample,
      html: detailHtml,
      ts: detailTs,
    },
    {
      id: 'columns',
      title: 'Column visibility, order and width',
      description:
        'Columns are plain data, so hide one by setting <code>hidden</code>. With <code>reorderable</code>, headers can be dragged onto each other, and <code>moveColumn(key, index)</code> gives keyboard and touch users the same control, as the arrow buttons here do. With <code>resizable</code> (or a column’s own <code>resizable</code>), each header gets a handle that you drag, or focus and move with the arrow keys (Shift for bigger steps). Both write the new order and widths back through <code>[(columns)]</code>, so you can save them.',
      example: TableColumnsExample,
      html: columnsHtml,
      ts: columnsTs,
    },
    {
      id: 'sticky-header',
      title: 'Sticky header',
      description:
        'Set <code>stickyHeader</code> to keep the header in view while the table scrolls inside a container with a height. Make the scroll container focusable and give it a name so keyboard users can scroll it.',
      example: TableStickyExample,
      html: stickyHtml,
      ts: stickyTs,
    },
    {
      id: 'loading-and-empty',
      title: 'Loading and empty states',
      description:
        'While <code>loading</code> is set, the table shows a spinner row and <code>aria-busy="true"</code>. When no rows are left, it shows <code>emptyText</code>, or your own <code>ng-template bsTableEmpty</code>.',
      example: TableStatesExample,
      html: statesHtml,
      ts: statesTs,
    },
    {
      id: 'server-side',
      title: 'Server-side data',
      description:
        'Set <code>manual</code> when a server sorts, filters and pages: the table shows <code>data</code> as it is, still updates <code>sort</code> and <code>page</code> when users click, and uses <code>total</code> for <code>pageCount()</code>. Here a <code>resource</code> refetches when either changes.',
      example: TableServerExample,
      html: serverHtml,
      ts: serverTs,
    },
    {
      id: 'stacked',
      title: 'Stacked on small screens',
      description:
        'Set <code>stacked</code> to a breakpoint to show each row as a block, with column names as labels, when the surrounding <code>.table-responsive</code> container is narrower than it. Set it to <code>always</code> to always stack.',
      example: TableStackedExample,
      html: stackedHtml,
      ts: stackedTs,
    },
  ],
  api: [
    {
      name: 'BsTable',
      selector: 'table[bsTable]',
      exportAs: 'bsTable',
      inputs: [
        {
          name: 'data',
          type: 'readonly T[]',
          default: 'required',
          description: 'Rows of the table.',
        },
        {
          name: 'columns',
          type: 'BsTableColumn<T>[]',
          default: 'required',
          description:
            'Column definitions. Supports [(columns)]; resizing and reordering write back.',
        },
        {
          name: 'rowKey',
          type: '(row: T) => unknown',
          default: 'row => row',
          description:
            'Returns a unique key for a row, used to track rows, selection and expansion.',
        },
        {
          name: 'sort',
          type: 'BsTableSort | null',
          default: 'null',
          description: 'Sorted column and direction. Supports [(sort)].',
        },
        {
          name: 'filter',
          type: 'string',
          default: "''",
          description: 'Text filter matched against the text of every filterable, visible column.',
        },
        {
          name: 'filterFn',
          type: '((row: T, filter: string) => boolean) | null',
          default: 'null',
          description: 'Custom filter, called with each row and the trimmed filter text.',
        },
        {
          name: 'page',
          type: 'number',
          default: '1',
          description: 'Current page, starting at 1. Supports [(page)].',
        },
        {
          name: 'pageSize',
          type: 'number',
          default: '0',
          description: 'Rows per page. 0 shows every row.',
        },
        {
          name: 'manual',
          type: 'boolean',
          default: 'false',
          description: 'Leaves sorting, filtering and paging to you, such as on a server.',
        },
        {
          name: 'total',
          type: 'number | null',
          default: 'null',
          description: 'Number of rows across all pages, in manual mode.',
        },
        {
          name: 'selection',
          type: "'none' | 'single' | 'multiple'",
          default: "'none'",
          description: 'How rows can be selected.',
        },
        {
          name: 'selected',
          type: 'T[]',
          default: '[]',
          description: 'Selected rows. Supports [(selected)].',
        },
        {
          name: 'expanded',
          type: 'T[]',
          default: '[]',
          description: 'Expanded rows. Supports [(expanded)].',
        },
        {
          name: 'resizable',
          type: 'boolean',
          default: 'false',
          description: 'Shows resize handles on every column.',
        },
        {
          name: 'reorderable',
          type: 'boolean',
          default: 'false',
          description: 'Lets users drag column headers to reorder them.',
        },
        {
          name: 'stickyHeader',
          type: 'boolean',
          default: 'false',
          description: 'Keeps the header in view while the table scrolls in its container.',
        },
        {
          name: 'loading',
          type: 'boolean',
          default: 'false',
          description: 'Shows a loading row and sets aria-busy.',
        },
        {
          name: 'striped',
          type: 'boolean',
          default: 'false',
          description: 'Zebra-stripes the rows.',
        },
        {
          name: 'hover',
          type: 'boolean',
          default: 'false',
          description: 'Highlights the row under the pointer.',
        },
        {
          name: 'bordered',
          type: 'boolean',
          default: 'false',
          description: 'Adds borders on every side of the table and cells.',
        },
        {
          name: 'borderless',
          type: 'boolean',
          default: 'false',
          description: 'Removes all borders.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'Cell density.',
        },
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the table.',
        },
        {
          name: 'stacked',
          type: 'BsTableStacked | null',
          default: 'null',
          description:
            "Stacks rows into blocks below a container breakpoint ('sm' to '2xl'), or 'always'.",
        },
        {
          name: 'emptyText',
          type: 'string',
          default: "'No results'",
          description: 'Text shown when there are no rows.',
        },
        {
          name: 'loadingText',
          type: 'string',
          default: "'Loading…'",
          description: 'Text of the loading row.',
        },
        {
          name: 'selectAllLabel',
          type: 'string',
          default: "'Select all rows'",
          description: 'Accessible label of the select-all checkbox.',
        },
        {
          name: 'selectHeader',
          type: 'string',
          default: "'Select'",
          description: 'Accessible name of the selection column header.',
        },
        {
          name: 'rowLabel',
          type: '(row: T) => string',
          default: 'first column text',
          description: "Accessible label of each row's checkbox or radio.",
        },
        {
          name: 'detailHeader',
          type: 'string',
          default: "'Details'",
          description: 'Accessible name of the expand column header.',
        },
        {
          name: 'expandLabel',
          type: 'string',
          default: "'Show details'",
          description: "Accessible label of each row's expand button.",
        },
        {
          name: 'resizeLabel',
          type: 'string',
          default: "'Resize'",
          description: "Start of each resize handle's label, followed by the column header.",
        },
      ],
      outputs: [
        {
          name: 'columnsChange',
          type: 'BsTableColumn<T>[]',
          description: 'Emits columns with new widths or order.',
        },
        {
          name: 'sortChange',
          type: 'BsTableSort | null',
          description: 'Emits the new sort.',
        },
        {
          name: 'pageChange',
          type: 'number',
          description: 'Emits the new page.',
        },
        {
          name: 'selectedChange',
          type: 'T[]',
          description: 'Emits the selected rows.',
        },
        {
          name: 'expandedChange',
          type: 'T[]',
          description: 'Emits the expanded rows.',
        },
      ],
      methods: [
        {
          name: 'rows()',
          type: 'readonly T[]',
          description: 'Rows on the current page, after filtering and sorting.',
        },
        {
          name: 'filteredRows()',
          type: 'readonly T[]',
          description: 'Rows matching the filter.',
        },
        {
          name: 'visibleColumns()',
          type: 'BsTableColumn<T>[]',
          description: 'Columns that are not hidden.',
        },
        {
          name: 'totalRows()',
          type: 'number',
          description: 'Number of rows across all pages.',
        },
        {
          name: 'pageCount()',
          type: 'number',
          description: 'Number of pages, at least 1.',
        },
        {
          name: 'currentPage()',
          type: 'number',
          description: 'Current page, clamped to the available pages.',
        },
        {
          name: 'select(row) / deselect(row) / toggleSelected(row)',
          type: 'void',
          description: 'Changes the selection.',
        },
        {
          name: 'toggleAll()',
          type: 'void',
          description: 'Selects every row on the page, or unselects them when they all are.',
        },
        {
          name: 'toggleExpanded(row)',
          type: 'void',
          description: "Shows or hides a row's detail.",
        },
        {
          name: 'toggleSort(column)',
          type: 'void',
          description: 'Cycles a column through ascending, descending and unsorted.',
        },
        {
          name: 'moveColumn(key, index)',
          type: 'void',
          description: 'Moves a column to a new position.',
        },
        {
          name: 'setWidth(key, width)',
          type: 'void',
          description: 'Sets a column width in pixels.',
        },
      ],
    },
    {
      name: 'BsTableColumn',
      selector: 'interface (columns input)',
      inputs: [
        {
          name: 'key',
          type: 'string',
          description: 'Unique key, and the row property shown by default.',
        },
        {
          name: 'header',
          type: 'string',
          description: 'Header text.',
        },
        {
          name: 'value',
          type: '(row: T) => unknown',
          description: 'Reads the cell value from a row.',
        },
        {
          name: 'format',
          type: '(value: unknown, row: T) => string',
          description: 'Formats the value as text.',
        },
        {
          name: 'sortable',
          type: 'boolean',
          description: 'Shows a sort button in the header.',
        },
        {
          name: 'compare',
          type: '(a: T, b: T) => number',
          description: 'Compares two rows for sorting, ascending.',
        },
        {
          name: 'filterable',
          type: 'boolean',
          description: 'Includes the column in the text filter. Defaults to true.',
        },
        {
          name: 'hidden',
          type: 'boolean',
          description: 'Hides the column.',
        },
        {
          name: 'width / minWidth / maxWidth',
          type: 'number',
          description: 'Width and resize limits in pixels (defaults 48 and 1000).',
        },
        {
          name: 'resizable',
          type: 'boolean',
          description: "Shows a resize handle, overriding the table's resizable.",
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end'",
          description: 'Text alignment of the header and cells.',
        },
        {
          name: 'headerClass / cellClass',
          type: 'string',
          description: 'Classes added to the header cell and each cell.',
        },
      ],
    },
    {
      name: 'BsTableCell',
      selector: 'ng-template[bsTableCell]',
      inputs: [
        {
          name: 'bsTableCell',
          type: 'string',
          default: 'required',
          description: 'Key of the column.',
        },
        {
          name: 'bsTableCellOf',
          type: 'readonly T[]',
          default: '[]',
          description: 'The rows, only to type the template context.',
        },
      ],
    },
    {
      name: 'BsTableDetail',
      selector: 'ng-template[bsTableDetail]',
      inputs: [
        {
          name: 'bsTableDetailOf',
          type: 'readonly T[]',
          default: '[]',
          description: 'The rows, only to type the template context.',
        },
      ],
    },
    {
      name: 'BsTableEmpty',
      selector: 'ng-template[bsTableEmpty]',
    },
  ],
};

@Component({
  selector: 'docs-table-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class TablePage {
  protected readonly page = PAGE;
}
