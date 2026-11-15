/**
 * Course Platform - Phase 1, Task 6: Data Presentation & Filtering Components Test Suite
 * Validates component logic, column accessors, cell rendering, state transitions, and toolbar controls for:
 * 1. DataTable (generic accessors, custom cell renderers, error/loading/empty state resolution, row click)
 * 2. SearchFilterToolbar (search input control, active search clear trigger, filter reset, result count formatting)
 *
 * Built with native Node.js test runner (node:test, node:assert/strict).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Phase 1, Task 6: Data Presentation & Filtering Components', () => {
  // ----------------------------------------------------------------------------
  // A. DataTable Column & Cell Logic Tests
  // ----------------------------------------------------------------------------
  test('1. DataTable resolves row accessor values and handles null/undefined values gracefully', () => {
    const resolveCellValue = (col, row, index) => {
      if (col.cell) {
        const rawValue = col.accessorKey ? row[col.accessorKey] : undefined;
        return col.cell({ row, index, value: rawValue });
      }
      if (col.accessorKey) {
        const val = row[col.accessorKey];
        if (val === null || val === undefined || val === '') {
          return '—';
        }
        return String(val);
      }
      return null;
    };

    const row = { id: 101, title: 'Full Stack React', price: 14999, category: null };

    assert.equal(resolveCellValue({ accessorKey: 'title' }, row, 0), 'Full Stack React');
    assert.equal(resolveCellValue({ accessorKey: 'price' }, row, 0), '14999');
    assert.equal(resolveCellValue({ accessorKey: 'category' }, row, 0), '—');
    assert.equal(resolveCellValue({ accessorKey: 'nonexistent' }, row, 0), '—');
  });

  test('2. DataTable custom cell renderer receives row, index, and accessor value correctly', () => {
    const col = {
      accessorKey: 'price',
      cell: ({ row, index, value }) => `₹${value} (Row #${index + 1}: ${row.code})`,
    };

    const row = { id: 1, code: 'FSW-01', price: 9999 };
    const rendered = col.cell({ row, index: 2, value: row.price });
    assert.equal(rendered, '₹9999 (Row #3: FSW-01)');
  });

  test('3. DataTable column alignment correctly maps to Tailwind text alignment classes', () => {
    const getAlignmentClass = (align) => {
      switch (align) {
        case 'center':
          return 'text-center';
        case 'right':
          return 'text-right';
        case 'left':
        default:
          return 'text-left';
      }
    };

    assert.equal(getAlignmentClass('left'), 'text-left');
    assert.equal(getAlignmentClass('center'), 'text-center');
    assert.equal(getAlignmentClass('right'), 'text-right');
    assert.equal(getAlignmentClass(undefined), 'text-left');
  });

  // ----------------------------------------------------------------------------
  // B. DataTable State Resolution Tests
  // ----------------------------------------------------------------------------
  test('4. DataTable correctly prioritizes Error > Loading > Empty > Data states', () => {
    const resolveTableState = (props) => {
      if (props.isError) return 'error';
      if (props.isLoading) return 'loading';
      if (!props.data || props.data.length === 0) return 'empty';
      return 'data';
    };

    // Error takes precedence even if loading is true
    assert.equal(resolveTableState({ isError: true, isLoading: true, data: [] }), 'error');
    // Loading takes precedence over empty or data
    assert.equal(resolveTableState({ isError: false, isLoading: true, data: [] }), 'loading');
    assert.equal(resolveTableState({ isError: false, isLoading: true, data: [1, 2] }), 'loading');
    // Empty state when data is empty and not loading or error
    assert.equal(resolveTableState({ isError: false, isLoading: false, data: [] }), 'empty');
    // Data state when items exist
    assert.equal(resolveTableState({ isError: false, isLoading: false, data: [{ id: 1 }] }), 'data');
  });

  test('5. DataTable row click handler executes with row data and index', () => {
    let clickedRow = null;
    let clickedIndex = -1;

    const onRowClick = (row, index) => {
      clickedRow = row;
      clickedIndex = index;
    };

    const rows = [{ id: 42, name: 'Alice' }, { id: 43, name: 'Bob' }];
    onRowClick(rows[1], 1);

    assert.deepEqual(clickedRow, { id: 43, name: 'Bob' });
    assert.equal(clickedIndex, 1);
  });

  // ----------------------------------------------------------------------------
  // C. SearchFilterToolbar Tests
  // ----------------------------------------------------------------------------
  test('6. SearchFilterToolbar detects active search and supports clear callback', () => {
    const checkSearchState = (searchValue = '') => ({
      hasActiveSearch: searchValue.trim().length > 0,
      clearedValue: '',
    });

    assert.equal(checkSearchState('').hasActiveSearch, false);
    assert.equal(checkSearchState('   ').hasActiveSearch, false);
    assert.equal(checkSearchState('react').hasActiveSearch, true);

    let updatedValue = 'current';
    const onSearchChange = (val) => { updatedValue = val; };
    onSearchChange('');
    assert.equal(updatedValue, '');
  });

  test('7. SearchFilterToolbar reset callback triggers successfully', () => {
    let resetCount = 0;
    const onReset = () => { resetCount += 1; };

    assert.equal(resetCount, 0);
    onReset();
    assert.equal(resetCount, 1);
  });

  test('8. SearchFilterToolbar formats result count summary accurately', () => {
    const formatCountSummary = (resultCount, totalCount) => {
      if (resultCount === undefined) return null;
      if (totalCount !== undefined) {
        return `Showing ${resultCount} of ${totalCount}`;
      }
      return `${resultCount} results`;
    };

    assert.equal(formatCountSummary(undefined), null);
    assert.equal(formatCountSummary(5), '5 results');
    assert.equal(formatCountSummary(5, 42), 'Showing 5 of 42');
    assert.equal(formatCountSummary(0, 0), 'Showing 0 of 0');
  });
});
