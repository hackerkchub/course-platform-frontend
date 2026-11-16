import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Dashboard Navigation Serialization Tests', () => {
  const studentNavConfig = {
    title: 'Student Portal',
    brandHref: '/student/dashboard',
    brandIcon: 'GraduationCap',
    roleBadge: 'Student',
    roleBadgeVariant: 'primary',
    items: [
      { label: 'Overview', href: '/student/dashboard', icon: 'LayoutDashboard', exact: true },
      { label: 'My Courses', href: '/student/courses', icon: 'BookOpen' },
      { label: 'Wishlist', href: '/student/wishlist', icon: 'Heart' },
      { label: 'Demo Classes', href: '/student/demo-classes', icon: 'Calendar' },
      { label: 'Eligibility', href: '/student/eligibility', icon: 'Award' },
      { label: 'My Reviews', href: '/student/reviews', icon: 'Star' },
      { label: 'Profile & Settings', href: '/student/profile', icon: 'User' },
    ],
  };

  const counsellorNavConfig = {
    title: 'Counsellor Desk',
    brandHref: '/counsellor/dashboard',
    brandIcon: 'Headphones',
    roleBadge: 'Counsellor',
    roleBadgeVariant: 'accent',
    items: [
      { label: 'Desk Overview', href: '/counsellor/dashboard', icon: 'LayoutDashboard', exact: true },
      { label: 'Demo Leads Pipeline', href: '/counsellor/leads', icon: 'Inbox' },
      { label: 'Demo Schedules', href: '/counsellor/demos', icon: 'Calendar' },
      { label: 'Eligibility Consultations', href: '/counsellor/eligibility', icon: 'FileCheck' },
    ],
  };

  const adminNavConfig = {
    title: 'Admin Center',
    brandHref: '/admin/dashboard',
    brandIcon: 'ShieldAlert',
    roleBadge: 'Administrator',
    roleBadgeVariant: 'destructive',
    items: [
      { label: 'Executive Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard', exact: true },
      { label: 'Courses Management', href: '/admin/courses', icon: 'BookOpen' },
      { label: 'Categories & Taxonomy', href: '/admin/categories', icon: 'FolderTree' },
      { label: 'Instructors Registry', href: '/admin/instructors', icon: 'Users' },
      { label: 'Enrollments Ledger', href: '/admin/enrollments', icon: 'UserCheck' },
      { label: 'Demo Leads Desk', href: '/admin/leads', icon: 'Inbox' },
      { label: 'Eligibility Rules', href: '/admin/eligibility', icon: 'FileCheck2' },
      { label: 'Review Moderation', href: '/admin/reviews', icon: 'MessageSquare' },
      { label: 'Media Library', href: '/admin/media', icon: 'Image' },
      { label: 'System Health', href: '/admin/system', icon: 'Activity' },
    ],
  };

  function assertPlainSerializable(obj, label) {
    let serialized;
    assert.doesNotThrow(() => {
      serialized = JSON.stringify(obj);
    }, `${label} must be serializable to JSON without throwing`);

    const parsed = JSON.parse(serialized);
    assert.deepEqual(parsed, obj, `${label} round-trips cleanly through JSON`);

    // Verify brandIcon is string
    assert.equal(typeof obj.brandIcon, 'string', `${label} brandIcon must be a string`);

    // Verify all item icons are strings
    obj.items.forEach((item, index) => {
      assert.equal(
        typeof item.icon,
        'string',
        `${label} items[${index}] icon '${item.label}' must be a string identifier`
      );
    });
  }

  test('1. Student navigation config is 100% plain serializable object', () => {
    assertPlainSerializable(studentNavConfig, 'Student navigation config');
  });

  test('2. Counsellor navigation config is 100% plain serializable object', () => {
    assertPlainSerializable(counsellorNavConfig, 'Counsellor navigation config');
  });

  test('3. Admin navigation config is 100% plain serializable object', () => {
    assertPlainSerializable(adminNavConfig, 'Admin navigation config');
  });
});
