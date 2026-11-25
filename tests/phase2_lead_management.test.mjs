import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

// --- Logic mirroring backend/src/modules/demo/demo.service.js authorization & validation rules ---
// NOTE: This is a pure-logic SIMULATION function of backend/src/modules/demo/demo.service.js rules
// used to test policy boundaries without requiring live MySQL connection pool instantiation.
function evaluateLeadUpdateAuthorization(lead, payload, user) {
  const isCounsellor = user.role === 'counsellor';
  const isAdmin = ['admin', 'super_admin'].includes(user.role);

  if (!isAdmin && !isCounsellor) {
    return { allowed: false, status: 403, error: 'Unauthorized role' };
  }

  // Counsellor authorization rules
  if (isCounsellor) {
    const isAssignedToOther = lead.assigned_to && Number(lead.assigned_to) !== Number(user.id);
    const isUnassigned = !lead.assigned_to;
    const isAssignedToSelf = Number(lead.assigned_to) === Number(user.id);

    // 1. Trying to change assignment
    if (payload.assigned_to !== undefined) {
      if (isUnassigned) {
        if (Number(payload.assigned_to) !== Number(user.id)) {
          return {
            allowed: false,
            status: 403,
            error: 'Counsellors can only accept unassigned leads for themselves.',
          };
        }
      } else if (isAssignedToOther) {
        return {
          allowed: false,
          status: 403,
          error: 'You cannot reassign leads that are assigned to another counsellor.',
        };
      } else if (isAssignedToSelf && Number(payload.assigned_to) !== Number(user.id)) {
        return {
          allowed: false,
          status: 403,
          error: 'Counsellors cannot assign leads to other users.',
        };
      }
    }

    // 2. Modifying non-assignment fields on another counsellor's lead
    if (isAssignedToOther) {
      return {
        allowed: false,
        status: 403,
        error: 'You are not authorized to modify this lead as it is assigned to another counsellor.',
      };
    }

    // 3. Status transitions
    if (payload.status && payload.status !== lead.status) {
      const statusRank = {
        pending: 1,
        contacted: 2,
        scheduled: 3,
        completed: 4,
        cancelled: 99,
      };

      const currentRank = statusRank[lead.status] || 0;
      const targetRank = statusRank[payload.status] || 0;

      const isRevert = targetRank < currentRank && payload.status !== 'cancelled';
      if (isRevert) {
        return {
          allowed: false,
          status: 403,
          error: 'Only administrators can revert demo request status',
        };
      }

      if (payload.status === 'scheduled' && !payload.scheduled_at && !lead.scheduled_at) {
        return {
          allowed: false,
          status: 400,
          error: 'A valid scheduled date and time is required to mark a lead as scheduled.',
        };
      }
    }
  }

  // Admin has full authorization
  return { allowed: true, status: 200 };
}

// Activity log generation function mirroring backend/src/modules/demo/demo.service.js
function generateActivityLogs(current, data, updated, user) {
  const logs = [];
  const assignmentChanged = data.assigned_to !== undefined && data.assigned_to !== current.assigned_to;
  const statusChanged = data.status && data.status !== current.status;

  // 1. Record distinct assignment / reassignment / unassignment activity
  if (assignmentChanged) {
    const isUnassign = data.assigned_to === null;
    const action = isUnassign ? 'lead_unassigned' : 'lead_assigned';
    let note;
    if (isUnassign) {
      note = current.assigned_to
        ? `Lead unassigned from user #${current.assigned_to} by ${user.role}`
        : `Lead unassigned by ${user.role}`;
    } else {
      note = current.assigned_to
        ? `Lead reassigned from user #${current.assigned_to} to user #${data.assigned_to} by ${user.role}`
        : `Lead assigned to user #${data.assigned_to} by ${user.role}`;
    }

    logs.push({
      action,
      oldStatus: current.status,
      newStatus: current.status,
      note,
      performedBy: user.id,
    });
  }

  // 2. Record distinct status transition activity
  if (statusChanged) {
    const note = data.admin_notes || `Status updated from ${current.status} to ${updated.status} by ${user.role}`;
    logs.push({
      action: 'status_updated',
      oldStatus: current.status,
      newStatus: updated.status,
      note,
      performedBy: user.id,
    });
  }

  // 3. Record general update activity when neither assignment nor status changed
  if (!assignmentChanged && !statusChanged) {
    const otherFields = ['scheduled_at', 'meeting_link', 'follow_up_at', 'admin_notes', 'attended'];
    const hasOtherChanges = otherFields.some(
      (key) => data[key] !== undefined && data[key] !== current[key]
    );

    if (hasOtherChanges) {
      logs.push({
        action: 'updated',
        oldStatus: current.status,
        newStatus: updated.status,
        note: data.admin_notes || `Demo request updated by ${user.role}`,
        performedBy: user.id,
      });
    }
  }

  return logs;
}

// URL validator matching frontend LeadDetailsDrawer
function isValidMeetingUrl(str) {
  if (!str || !str.trim()) return true;
  try {
    const parsed = new URL(str.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

describe('Phase 2: Counsellor Lead Management Workflow Unit Tests', () => {
  // --- 1. Counsellor Lead Assignment & Ownership Authorization (Simulation) ---
  describe('1. Counsellor Lead Assignment & Ownership Authorization Tests (Simulation - Pure Logic)', () => {
    const unassignedLead = {
      id: 101,
      student_name: 'Rahul Sharma',
      status: 'pending',
      assigned_to: null,
      scheduled_at: null,
    };

    const leadAssignedToCounsellor1 = {
      id: 102,
      student_name: 'Priya Verma',
      status: 'contacted',
      assigned_to: 5,
      scheduled_at: null,
    };

    const counsellor1 = { id: 5, role: 'counsellor', name: 'Ananya Counsellor' };
    const counsellor2 = { id: 9, role: 'counsellor', name: 'Vikram Counsellor' };
    const adminUser = { id: 1, role: 'admin', name: 'Admin Himanshu' };
    const superAdminUser = { id: 2, role: 'super_admin', name: 'Super Admin' };

    test('1.1 Counsellor CAN accept unassigned lead for themselves', () => {
      const res = evaluateLeadUpdateAuthorization(
        unassignedLead,
        { assigned_to: counsellor1.id, status: 'contacted' },
        counsellor1
      );
      assert.strictEqual(res.allowed, true);
      assert.strictEqual(res.status, 200);
    });

    test('1.2 Counsellor CANNOT assign unassigned lead to another counsellor', () => {
      const res = evaluateLeadUpdateAuthorization(
        unassignedLead,
        { assigned_to: counsellor2.id },
        counsellor1
      );
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.status, 403);
      assert.match(res.error, /only accept unassigned leads for themselves/i);
    });

    test('1.3 Counsellor CANNOT reassign a lead assigned to another counsellor', () => {
      const res = evaluateLeadUpdateAuthorization(
        leadAssignedToCounsellor1,
        { assigned_to: counsellor2.id },
        counsellor2
      );
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.status, 403);
      assert.match(res.error, /cannot reassign leads that are assigned to another counsellor/i);
    });

    test('1.4 Counsellor CANNOT modify status/notes of a lead assigned to another counsellor (IDOR protection)', () => {
      const res = evaluateLeadUpdateAuthorization(
        leadAssignedToCounsellor1,
        { status: 'completed' },
        counsellor2
      );
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.status, 403);
      assert.match(res.error, /not authorized to modify this lead as it is assigned to another counsellor/i);
    });

    test('1.5 Counsellor CANNOT reassign their own lead to another user', () => {
      const res = evaluateLeadUpdateAuthorization(
        leadAssignedToCounsellor1,
        { assigned_to: counsellor2.id },
        counsellor1
      );
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.status, 403);
      assert.match(res.error, /cannot assign leads to other users/i);
    });

    test('1.6 Admin CAN assign unassigned lead to any counsellor', () => {
      const res = evaluateLeadUpdateAuthorization(
        unassignedLead,
        { assigned_to: counsellor2.id },
        adminUser
      );
      assert.strictEqual(res.allowed, true);
      assert.strictEqual(res.status, 200);
    });

    test('1.7 Admin CAN reassign an assigned lead to another counsellor or unassign', () => {
      const res1 = evaluateLeadUpdateAuthorization(
        leadAssignedToCounsellor1,
        { assigned_to: counsellor2.id },
        adminUser
      );
      assert.strictEqual(res1.allowed, true);

      const res2 = evaluateLeadUpdateAuthorization(
        leadAssignedToCounsellor1,
        { assigned_to: null },
        superAdminUser
      );
      assert.strictEqual(res2.allowed, true);
    });
  });

  // --- 2. Lead Status Transitions & Workflow Rules (Simulation) ---
  describe('2. Lead Status Transitions & Workflow Rules Tests (Simulation - Pure Logic)', () => {
    const counsellor = { id: 5, role: 'counsellor' };
    const admin = { id: 1, role: 'admin' };

    test('2.1 Forward status transition: pending -> contacted is allowed for counsellor', () => {
      const lead = { id: 10, status: 'pending', assigned_to: counsellor.id };
      const res = evaluateLeadUpdateAuthorization(lead, { status: 'contacted' }, counsellor);
      assert.strictEqual(res.allowed, true);
    });

    test('2.2 Forward status transition: contacted -> scheduled is allowed with valid scheduled_at', () => {
      const lead = { id: 10, status: 'contacted', assigned_to: counsellor.id };
      const res = evaluateLeadUpdateAuthorization(
        lead,
        { status: 'scheduled', scheduled_at: '2026-11-20T10:00:00' },
        counsellor
      );
      assert.strictEqual(res.allowed, true);
    });

    test('2.3 Setting status to scheduled WITHOUT scheduled_at is rejected for counsellor', () => {
      const lead = { id: 10, status: 'contacted', assigned_to: counsellor.id, scheduled_at: null };
      const res = evaluateLeadUpdateAuthorization(
        lead,
        { status: 'scheduled' },
        counsellor
      );
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.status, 400);
      assert.match(res.error, /scheduled date and time is required/i);
    });

    test('2.4 Forward status transition: scheduled -> completed is allowed', () => {
      const lead = {
        id: 10,
        status: 'scheduled',
        assigned_to: counsellor.id,
        scheduled_at: '2026-11-20T10:00:00',
      };
      const res = evaluateLeadUpdateAuthorization(lead, { status: 'completed' }, counsellor);
      assert.strictEqual(res.allowed, true);
    });

    test('2.5 Backward status transition: completed -> pending is REJECTED with HTTP 403 for counsellor', () => {
      const lead = { id: 10, status: 'completed', assigned_to: counsellor.id };
      const res = evaluateLeadUpdateAuthorization(lead, { status: 'pending' }, counsellor);
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.status, 403);
      assert.match(res.error, /Only administrators can revert demo request status/i);
    });

    test('2.6 Backward status transition: scheduled -> contacted is REJECTED with HTTP 403 for counsellor', () => {
      const lead = {
        id: 10,
        status: 'scheduled',
        assigned_to: counsellor.id,
        scheduled_at: '2026-11-20T10:00:00',
      };
      const res = evaluateLeadUpdateAuthorization(lead, { status: 'contacted' }, counsellor);
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.status, 403);
      assert.match(res.error, /Only administrators can revert demo request status/i);
    });

    test('2.7 Admin retains override capability for status transitions', () => {
      const lead = { id: 10, status: 'completed', assigned_to: counsellor.id };
      const res = evaluateLeadUpdateAuthorization(lead, { status: 'pending' }, admin);
      assert.strictEqual(res.allowed, true);
    });
  });

  // --- 3. Demo Scheduling & Meeting Link Validation (Unit Tests) ---
  describe('3. Demo Scheduling & Meeting Link Validation Tests (Unit Tests)', () => {
    test('3.1 Valid Google Meet link passes URL validation', () => {
      assert.strictEqual(isValidMeetingUrl('https://meet.google.com/xyz-abcd-efg'), true);
    });

    test('3.2 Valid Zoom meeting link passes URL validation', () => {
      assert.strictEqual(isValidMeetingUrl('https://zoom.us/j/9876543210?pwd=abc'), true);
    });

    test('3.3 Valid Microsoft Teams link passes URL validation', () => {
      assert.strictEqual(isValidMeetingUrl('https://teams.microsoft.com/l/meetup-join/19%3ameeting'), true);
    });

    test('3.4 Empty or whitespace link passes optional validation', () => {
      assert.strictEqual(isValidMeetingUrl(''), true);
      assert.strictEqual(isValidMeetingUrl('   '), true);
      assert.strictEqual(isValidMeetingUrl(null), true);
    });

    test('3.5 Malformed or non-http/https URL is rejected', () => {
      assert.strictEqual(isValidMeetingUrl('invalid-meeting-link'), false);
      assert.strictEqual(isValidMeetingUrl('ftp://example.com/meeting'), false);
      assert.strictEqual(isValidMeetingUrl('javascript:alert(1)'), false);
    });
  });

  // --- 4. LeadDetailsDrawer Source Code & Field Verification (Static Inspection) ---
  describe('4. LeadDetailsDrawer Source Code & Field Verification (Static Inspection)', () => {
    test('4.1 LeadDetailsDrawer source file must render all 11 required fields', async () => {
      const filePath = path.resolve(
        process.cwd(),
        'frontend/src/components/dashboard/LeadDetailsDrawer.tsx'
      );
      const source = await fs.readFile(filePath, 'utf8');

      // 1. Student Name
      assert.ok(source.includes('lead.student_name'), 'Should display lead.student_name');
      // 2. Student Email
      assert.ok(source.includes('lead.email'), 'Should display lead.email');
      // 3. Student Phone
      assert.ok(source.includes('lead.phone'), 'Should display lead.phone');
      // 4. Course / Program Name
      assert.ok(source.includes('lead.course_name'), 'Should display lead.course_name');
      // 5. Inquiry Date
      assert.ok(source.includes('lead.created_at'), 'Should display lead.created_at');
      // 6. Current Status
      assert.ok(source.includes('lead.status'), 'Should display lead.status');
      // 7. Assigned Counsellor
      assert.ok(source.includes('lead.assigned_user_name') || source.includes('assigned_to'), 'Should display assigned counsellor');
      // 8. Scheduled Date & Time
      assert.ok(source.includes('scheduled_at'), 'Should display and manage scheduled_at');
      // 9. Meeting Link
      assert.ok(source.includes('meeting_link'), 'Should display and manage meeting_link');
      // 10. Admin / Counsellor Notes
      assert.ok(source.includes('admin_notes') || source.includes('handleAddNote'), 'Should display and manage notes');
      // 11. Follow-up Date
      assert.ok(source.includes('follow_up_at'), 'Should display and manage follow_up_at');
    });

    test('4.2 LeadDetailsDrawer must contain Role-Based Assignment controls & IDOR lock', async () => {
      const filePath = path.resolve(
        process.cwd(),
        'frontend/src/components/dashboard/LeadDetailsDrawer.tsx'
      );
      const source = await fs.readFile(filePath, 'utf8');

      // Admin counsellor dropdown
      assert.ok(source.includes('adminCounsellorsApi.getCounsellors'), 'Should load counsellors for admin assignment');
      assert.ok(source.includes('handleExecuteAssignment'), 'Should support executing assignment/reassignment');
      assert.ok(source.includes('showReassignConfirm'), 'Should have confirm dialog for reassignment');

      // Counsellor Accept Lead action
      assert.ok(source.includes('handleAcceptLead'), 'Should support counsellor accepting lead');

      // IDOR protection lock
      assert.ok(source.includes('isAssignedToOtherCounsellor'), 'Should detect lead assigned to another counsellor');
      assert.ok(
        source.includes('This inquiry is assigned to') && source.includes('restricted to administrators'),
        'Should display lock banner for other counsellor leads'
      );
    });
  });

  // --- 5. Counsellor Dashboard Page Verification (Static Inspection) ---
  describe('5. Counsellor Dashboard Page Verification (Static Inspection)', () => {
    test('5.1 Counsellor Dashboard must mount LeadDetailsDrawer and Actions column', async () => {
      const filePath = path.resolve(
        process.cwd(),
        'frontend/src/app/(counsellor)/counsellor/dashboard/page.tsx'
      );
      const source = await fs.readFile(filePath, 'utf8');

      assert.ok(source.includes('<LeadDetailsDrawer'), 'Should mount LeadDetailsDrawer component');
      assert.ok(source.includes('handleOpenLead'), 'Should have handler to open drawer');
      assert.ok(source.includes('handleAcceptLeadQuick'), 'Should have quick action to accept lead');
      assert.ok(source.includes('handleMarkContactedQuick'), 'Should have quick action to mark lead contacted');
      assert.ok(source.includes('onRowClick={handleOpenLead}'), 'Should support opening drawer on row click');
      assert.ok(source.includes("id: 'actions'"), 'Should include actions column in DataTable columns');
    });
  });

  // --- 6. Activity & Audit Logging Logic Tests (Unit Tests) ---
  describe('6. Activity & Audit Logging Logic Tests (Unit Tests)', () => {
    const counsellor = { id: 5, role: 'counsellor' };
    const admin = { id: 1, role: 'admin' };

    test('6.1 Combined update (both assigned_to and status) generates TWO distinct activity records', () => {
      const current = { id: 101, assigned_to: null, status: 'pending' };
      const data = { assigned_to: 5, status: 'contacted' };
      const updated = { id: 101, assigned_to: 5, status: 'contacted' };

      const logs = generateActivityLogs(current, data, updated, counsellor);

      assert.strictEqual(logs.length, 2, 'Must generate exactly 2 activity logs');
      // First event: assignment
      assert.strictEqual(logs[0].action, 'lead_assigned');
      assert.strictEqual(logs[0].oldStatus, 'pending');
      assert.strictEqual(logs[0].newStatus, 'pending');
      assert.strictEqual(logs[0].performedBy, 5);
      assert.strictEqual(logs[0].note, 'Lead assigned to user #5 by counsellor');

      // Second event: status transition
      assert.strictEqual(logs[1].action, 'status_updated');
      assert.strictEqual(logs[1].oldStatus, 'pending');
      assert.strictEqual(logs[1].newStatus, 'contacted');
      assert.strictEqual(logs[1].performedBy, 5);
      assert.strictEqual(logs[1].note, 'Status updated from pending to contacted by counsellor');
    });

    test('6.2 Assignment-only update generates single lead_assigned activity record', () => {
      const current = { id: 101, assigned_to: null, status: 'contacted' };
      const data = { assigned_to: 9 };
      const updated = { id: 101, assigned_to: 9, status: 'contacted' };

      const logs = generateActivityLogs(current, data, updated, admin);

      assert.strictEqual(logs.length, 1);
      assert.strictEqual(logs[0].action, 'lead_assigned');
      assert.strictEqual(logs[0].note, 'Lead assigned to user #9 by admin');
      assert.strictEqual(logs[0].oldStatus, 'contacted');
      assert.strictEqual(logs[0].newStatus, 'contacted');
    });

    test('6.3 Admin unassignment (assigned_to = null) generates lead_unassigned activity preserving previous assignee', () => {
      const current = { id: 101, assigned_to: 5, status: 'contacted' };
      const data = { assigned_to: null };
      const updated = { id: 101, assigned_to: null, status: 'contacted' };

      const logs = generateActivityLogs(current, data, updated, admin);

      assert.strictEqual(logs.length, 1);
      assert.strictEqual(logs[0].action, 'lead_unassigned');
      assert.strictEqual(logs[0].note, 'Lead unassigned from user #5 by admin');
      assert.strictEqual(logs[0].performedBy, 1);
    });

    test('6.4 Admin reassignment preserves both prior and new assigned counsellors in note', () => {
      const current = { id: 101, assigned_to: 5, status: 'contacted' };
      const data = { assigned_to: 9 };
      const updated = { id: 101, assigned_to: 9, status: 'contacted' };

      const logs = generateActivityLogs(current, data, updated, admin);

      assert.strictEqual(logs.length, 1);
      assert.strictEqual(logs[0].action, 'lead_assigned');
      assert.strictEqual(logs[0].note, 'Lead reassigned from user #5 to user #9 by admin');
    });

    test('6.5 Status-only update generates single status_updated activity record', () => {
      const current = { id: 101, assigned_to: 5, status: 'contacted' };
      const data = { status: 'scheduled' };
      const updated = { id: 101, assigned_to: 5, status: 'scheduled' };

      const logs = generateActivityLogs(current, data, updated, counsellor);

      assert.strictEqual(logs.length, 1);
      assert.strictEqual(logs[0].action, 'status_updated');
      assert.strictEqual(logs[0].oldStatus, 'contacted');
      assert.strictEqual(logs[0].newStatus, 'scheduled');
    });

    test('6.6 General update (e.g. meeting_link only) generates single updated activity record', () => {
      const current = { id: 101, assigned_to: 5, status: 'scheduled', meeting_link: null };
      const data = { meeting_link: 'https://meet.google.com/xyz-abcd-efg' };
      const updated = { id: 101, assigned_to: 5, status: 'scheduled', meeting_link: 'https://meet.google.com/xyz-abcd-efg' };

      const logs = generateActivityLogs(current, data, updated, counsellor);

      assert.strictEqual(logs.length, 1);
      assert.strictEqual(logs[0].action, 'updated');
      assert.strictEqual(logs[0].note, 'Demo request updated by counsellor');
    });

    test('6.7 No-op update generates zero activity records', () => {
      const current = { id: 101, assigned_to: 5, status: 'scheduled' };
      const data = { status: 'scheduled', assigned_to: 5 };
      const updated = { id: 101, assigned_to: 5, status: 'scheduled' };

      const logs = generateActivityLogs(current, data, updated, counsellor);

      assert.strictEqual(logs.length, 0, 'No activity logs should be generated for a no-op update');
    });
  });
});
