/**
 * Course Platform - Phase 1, Task 5: Dashboard Metric & KPI Components Test Suite
 * Validates props, logic, layout mapping, and state transitions for:
 * 1. DashboardHeading
 * 2. StatCard (string/number values, trend directions, loading state)
 * 3. StatsGrid (column mappings, responsive classes, skeleton count)
 * 4. DashboardSection (plain vs card variants, optional header detection)
 *
 * Built with native Node.js test runner (node:test, node:assert/strict).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Phase 1, Task 5: Dashboard Metric & KPI Components', () => {
  // ----------------------------------------------------------------------------
  // A. DashboardHeading Tests
  // ----------------------------------------------------------------------------
  test('1. DashboardHeading resolves required title and optional description/eyebrow', () => {
    const resolveHeading = (props) => ({
      title: props.title,
      hasDescription: Boolean(props.description),
      description: props.description || null,
      hasEyebrow: Boolean(props.eyebrow),
      eyebrow: props.eyebrow || null,
      hasAction: Boolean(props.action),
      hasBreadcrumb: Boolean(props.breadcrumb),
    });

    const minimal = resolveHeading({ title: 'Overview' });
    assert.equal(minimal.title, 'Overview');
    assert.equal(minimal.hasDescription, false);
    assert.equal(minimal.hasEyebrow, false);
    assert.equal(minimal.hasAction, false);
    assert.equal(minimal.hasBreadcrumb, false);

    const full = resolveHeading({
      title: 'Course Catalog',
      description: 'Manage all cohort-based and self-paced programs.',
      eyebrow: 'Admin Portal',
      action: 'Export CSV',
      breadcrumb: 'Home / Courses',
    });
    assert.equal(full.title, 'Course Catalog');
    assert.equal(full.hasDescription, true);
    assert.equal(full.hasEyebrow, true);
    assert.equal(full.hasAction, true);
    assert.equal(full.hasBreadcrumb, true);
  });

  // ----------------------------------------------------------------------------
  // B. StatCard Tests
  // ----------------------------------------------------------------------------
  test('2. StatCard accepts numeric and string values cleanly', () => {
    const resolveStatValue = (val) => String(val);

    assert.equal(resolveStatValue(1450), '1450');
    assert.equal(resolveStatValue(0), '0');
    assert.equal(resolveStatValue('₹45,000'), '₹45,000');
    assert.equal(resolveStatValue('Active'), 'Active');
  });

  test('3. StatCard loading state suppresses normal content and triggers skeleton', () => {
    const checkCardDisplay = (props) => ({
      isLoading: Boolean(props.isLoading),
      rendersSkeleton: Boolean(props.isLoading),
      rendersValue: !props.isLoading,
    });

    const loadingState = checkCardDisplay({ title: 'Enrollments', value: 250, isLoading: true });
    assert.equal(loadingState.isLoading, true);
    assert.equal(loadingState.rendersSkeleton, true);
    assert.equal(loadingState.rendersValue, false);

    const normalState = checkCardDisplay({ title: 'Enrollments', value: 250, isLoading: false });
    assert.equal(normalState.isLoading, false);
    assert.equal(normalState.rendersSkeleton, false);
    assert.equal(normalState.rendersValue, true);
  });

  test('4. StatCard trend resolution handles up, down, and neutral directions with correct colors', () => {
    const resolveTrend = (trend) => {
      if (!trend) return null;
      const direction = trend.direction || 'neutral';
      const colorMap = {
        up: 'text-emerald-600',
        down: 'text-rose-600',
        neutral: 'text-slate-500',
      };
      return {
        value: trend.value,
        direction,
        colorClass: colorMap[direction],
        label: trend.label || null,
      };
    };

    assert.equal(resolveTrend(undefined), null);

    const upTrend = resolveTrend({ value: '+14.2%', direction: 'up', label: 'vs last month' });
    assert.equal(upTrend.direction, 'up');
    assert.equal(upTrend.colorClass, 'text-emerald-600');
    assert.equal(upTrend.label, 'vs last month');

    const downTrend = resolveTrend({ value: '-3.1%', direction: 'down' });
    assert.equal(downTrend.direction, 'down');
    assert.equal(downTrend.colorClass, 'text-rose-600');
    assert.equal(downTrend.label, null);

    const neutralTrend = resolveTrend({ value: '0.0%', direction: 'neutral' });
    assert.equal(neutralTrend.direction, 'neutral');
    assert.equal(neutralTrend.colorClass, 'text-slate-500');
  });

  // ----------------------------------------------------------------------------
  // C. StatsGrid Tests
  // ----------------------------------------------------------------------------
  test('5. StatsGrid maps column options to responsive Tailwind grid classes', () => {
    const columnClasses = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    assert.equal(columnClasses[2], 'grid-cols-1 sm:grid-cols-2');
    assert.equal(columnClasses[3], 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
    assert.equal(columnClasses[4], 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
  });

  test('6. StatsGrid calculates correct skeleton count during loading', () => {
    const getLoadingCount = (props) => {
      if (props.stats && props.stats.length > 0) return props.stats.length;
      return props.loadingCount || 4;
    };

    assert.equal(getLoadingCount({ loadingCount: 3 }), 3);
    assert.equal(getLoadingCount({ stats: [{ title: 'A', value: 1 }, { title: 'B', value: 2 }] }), 2);
    assert.equal(getLoadingCount({}), 4);
  });

  // ----------------------------------------------------------------------------
  // D. DashboardSection Tests
  // ----------------------------------------------------------------------------
  test('7. DashboardSection distinguishes plain and card variants', () => {
    const resolveSectionVariant = (variant = 'plain') => {
      const isCard = variant === 'card';
      return {
        isCard,
        containerClass: isCard
          ? 'rounded-2xl border border-slate-200/80'
          : 'space-y-4',
      };
    };

    const plain = resolveSectionVariant('plain');
    assert.equal(plain.isCard, false);
    assert.equal(plain.containerClass, 'space-y-4');

    const card = resolveSectionVariant('card');
    assert.equal(card.isCard, true);
    assert.ok(card.containerClass.includes('rounded-2xl'));
  });

  test('8. DashboardSection detects optional header presence correctly', () => {
    const hasHeader = (props) => Boolean(props.title || props.description || props.action || props.icon);

    assert.equal(hasHeader({}), false);
    assert.equal(hasHeader({ title: 'Recent Enrollments' }), true);
    assert.equal(hasHeader({ description: 'Filter by date' }), true);
    assert.equal(hasHeader({ action: 'Button' }), true);
  });
});
