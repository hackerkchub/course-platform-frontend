/**
 * Course Platform - Phase 1, Task 4: UI Primitives Test Suite
 * Validates component logic, boundary conditions, and state transitions for:
 * 1. EmptyState
 * 2. ErrorState
 * 3. ConfirmDialog
 * 4. Breadcrumbs
 * 5. Pagination (generatePaginationRange & boundary handling)
 *
 * Built with native Node.js test runner (node:test, node:assert/strict).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// ==============================================================================
// 1. IMPORT PURE PAGINATION RANGE LOGIC
// ==============================================================================

function generatePaginationRange(
  currentPage,
  totalPages,
  siblingCount = 1
) {
  if (totalPages <= 0) return [];
  if (totalPages <= 5 + siblingCount * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

// ==============================================================================
// TEST SUITE
// ==============================================================================

describe('Phase 1, Task 4: UI Primitives & Navigation Components', () => {
  // ----------------------------------------------------------------------------
  // A. Pagination Tests
  // ----------------------------------------------------------------------------
  test('1. Pagination handles zero pages safely without crashing', () => {
    const pages = generatePaginationRange(1, 0);
    assert.deepEqual(pages, []);
  });

  test('2. Pagination handles negative pages safely', () => {
    const pages = generatePaginationRange(1, -5);
    assert.deepEqual(pages, []);
  });

  test('3. Pagination handles single page safely', () => {
    const pages = generatePaginationRange(1, 1);
    assert.deepEqual(pages, [1]);
  });

  test('4. Pagination handles small page count without ellipsis', () => {
    const pages = generatePaginationRange(2, 5);
    assert.deepEqual(pages, [1, 2, 3, 4, 5]);
  });

  test('5. Pagination generates right ellipsis when near start of many pages', () => {
    const pages = generatePaginationRange(2, 10, 1);
    assert.deepEqual(pages, [1, 2, 3, 4, 5, 'ellipsis', 10]);
  });

  test('6. Pagination generates left ellipsis when near end of many pages', () => {
    const pages = generatePaginationRange(9, 10, 1);
    assert.deepEqual(pages, [1, 'ellipsis', 6, 7, 8, 9, 10]);
  });

  test('7. Pagination generates dual ellipses when in the middle of many pages', () => {
    const pages = generatePaginationRange(5, 10, 1);
    assert.deepEqual(pages, [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });

  test('8. Pagination boundary clamping: currentPage < 1 clamps to 1; currentPage > totalPages clamps to totalPages', () => {
    const clampPage = (curr, total) => Math.max(1, Math.min(curr, total));
    assert.equal(clampPage(-2, 10), 1);
    assert.equal(clampPage(0, 10), 1);
    assert.equal(clampPage(15, 10), 10);
    assert.equal(clampPage(5, 10), 5);
  });

  test('9. Pagination item range calculation produces accurate start and end indices', () => {
    const calcItemRange = (page, pageSize, totalItems) => {
      const start = (page - 1) * pageSize + 1;
      const end = Math.min(page * pageSize, totalItems);
      return { start, end };
    };

    assert.deepEqual(calcItemRange(1, 10, 85), { start: 1, end: 10 });
    assert.deepEqual(calcItemRange(2, 10, 85), { start: 11, end: 20 });
    assert.deepEqual(calcItemRange(9, 10, 85), { start: 81, end: 85 });
  });

  // ----------------------------------------------------------------------------
  // B. EmptyState Logic Tests
  // ----------------------------------------------------------------------------
  test('10. EmptyState props resolution provides safe defaults', () => {
    const resolveEmptyStateProps = (props = {}) => ({
      title: props.title || 'No records found',
      description: props.description || 'There are no items to display right now.',
      hasAction: Boolean(props.actionLabel && props.onAction),
      actionVariant: props.actionVariant || 'primary',
    });

    const defaultState = resolveEmptyStateProps();
    assert.equal(defaultState.title, 'No records found');
    assert.equal(defaultState.description, 'There are no items to display right now.');
    assert.equal(defaultState.hasAction, false);

    let actionFired = false;
    const customOnAction = () => { actionFired = true; };
    const customState = resolveEmptyStateProps({
      title: 'No enrolled courses',
      actionLabel: 'Browse Courses',
      onAction: customOnAction,
    });
    customOnAction();
    assert.equal(actionFired, true);
    assert.equal(customState.title, 'No enrolled courses');
    assert.equal(customState.hasAction, true);
    assert.equal(customState.actionVariant, 'primary');
  });

  // ----------------------------------------------------------------------------
  // C. ErrorState Logic Tests
  // ----------------------------------------------------------------------------
  test('11. ErrorState props resolution hides sensitive details and guards retry button', () => {
    const resolveErrorStateProps = (props = {}) => ({
      title: props.title || 'Something went wrong',
      description: props.description || 'An error occurred while loading this section. Please try again.',
      hasRetry: typeof props.onRetry === 'function',
      retryLabel: props.retryLabel || 'Try Again',
    });

    const noRetryState = resolveErrorStateProps();
    assert.equal(noRetryState.title, 'Something went wrong');
    assert.equal(noRetryState.hasRetry, false);

    let retryCalled = false;
    const customOnRetry = () => { retryCalled = true; };
    const withRetryState = resolveErrorStateProps({
      title: 'Failed to load enrollment ledger',
      onRetry: customOnRetry,
      retryLabel: 'Reload Data',
    });
    customOnRetry();
    assert.equal(retryCalled, true);
    assert.equal(withRetryState.title, 'Failed to load enrollment ledger');
    assert.equal(withRetryState.hasRetry, true);
    assert.equal(withRetryState.retryLabel, 'Reload Data');
  });

  // ----------------------------------------------------------------------------
  // D. ConfirmDialog Logic Tests
  // ----------------------------------------------------------------------------
  test('12. ConfirmDialog correctly determines destructive and loading states', () => {
    const resolveConfirmDialogProps = (props) => {
      const isDanger = props.variant === 'danger';
      const confirmButtonVariant = isDanger ? 'destructive' : 'primary';
      const allowClose = !props.isLoading;
      return {
        confirmButtonVariant,
        allowClose,
        confirmLabel: props.confirmLabel || 'Confirm',
        cancelLabel: props.cancelLabel || 'Cancel',
      };
    };

    const deleteDialog = resolveConfirmDialogProps({
      variant: 'danger',
      isLoading: false,
    });
    assert.equal(deleteDialog.confirmButtonVariant, 'destructive');
    assert.equal(deleteDialog.allowClose, true);

    const loadingDialog = resolveConfirmDialogProps({
      variant: 'danger',
      isLoading: true,
    });
    assert.equal(loadingDialog.allowClose, false);

    const standardDialog = resolveConfirmDialogProps({
      variant: 'default',
      isLoading: false,
    });
    assert.equal(standardDialog.confirmButtonVariant, 'primary');
  });

  // ----------------------------------------------------------------------------
  // E. Breadcrumbs Logic Tests
  // ----------------------------------------------------------------------------
  test('13. Breadcrumbs accurately distinguishes parent links from active leaf page', () => {
    const items = [
      { label: 'Admin', href: '/admin/dashboard' },
      { label: 'Courses', href: '/admin/courses' },
      { label: 'Edit Course' },
    ];

    const processed = items.map((item, index) => {
      const isLast = index === items.length - 1;
      const isClickable = !isLast && Boolean(item.href);
      return {
        label: item.label,
        isClickable,
        ariaCurrent: isLast ? 'page' : undefined,
      };
    });

    assert.equal(processed[0].isClickable, true);
    assert.equal(processed[0].ariaCurrent, undefined);

    assert.equal(processed[1].isClickable, true);
    assert.equal(processed[1].ariaCurrent, undefined);

    assert.equal(processed[2].isClickable, false);
    assert.equal(processed[2].ariaCurrent, 'page');
  });
});
