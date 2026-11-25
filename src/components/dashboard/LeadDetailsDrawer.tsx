'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { adminLeadsApi } from '@/lib/api/admin-leads';
import { adminCounsellorsApi } from '@/lib/api/admin-counsellors';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import type {
  DemoLeadDetail,
  LeadStatus,
} from '@/types/admin-lead';
import { LEAD_STATUS_RANKS } from '@/types/admin-lead';
import type { CounsellorItem } from '@/types/admin-counsellor';
import { useAuth } from '@/providers/auth-provider';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Video,
  FileText,
  UserCheck,
  Trash2,
  Send,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  User,
  Lock,
  UserPlus,
  RefreshCw,
} from 'lucide-react';

interface LeadDetailsDrawerProps {
  leadId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
}

const ALL_STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: 'pending', label: 'Pending (New)' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Demo Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function LeadDetailsDrawer({
  leadId,
  isOpen,
  onClose,
  onLeadUpdated,
}: LeadDetailsDrawerProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isCounsellor = user?.role === 'counsellor';

  const [lead, setLead] = useState<DemoLeadDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Status & scheduling form state
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('pending');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [followUpAt, setFollowUpAt] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusSuccess, setStatusSuccess] = useState<string>('');

  // Assignment states
  const [counsellors, setCounsellors] = useState<CounsellorItem[]>([]);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState<number | 'unassigned'>('unassigned');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [showReassignConfirm, setShowReassignConfirm] = useState<boolean>(false);

  // Note form state
  const [noteText, setNoteText] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [noteError, setNoteError] = useState<string>('');

  // Admin convert & delete states
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchDetails = useCallback(async (id: number) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminLeadsApi.getLeadById(id);
      setLead(data);
      setSelectedStatus(data.status);
      setSelectedCounsellorId(data.assigned_to ? data.assigned_to : 'unassigned');
      setMeetingLink(data.meeting_link || '');
      setScheduledAt(data.scheduled_at ? data.scheduled_at.slice(0, 16) : '');
      setFollowUpAt(data.follow_up_at ? data.follow_up_at.slice(0, 16) : '');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch lead details'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch active counsellors for admins to manage assignment
  const fetchCounsellorsList = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await adminCounsellorsApi.getCounsellors({ status: 'active', limit: 100 });
      setCounsellors(res.counsellors || []);
    } catch (err) {
      console.error('Failed to load counsellors for assignment dropdown:', err);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isOpen && leadId) {
      fetchDetails(leadId);
      fetchCounsellorsList();
      setStatusSuccess('');
      setNoteError('');
      setNoteText('');
    } else {
      setLead(null);
    }
  }, [isOpen, leadId, fetchDetails, fetchCounsellorsList]);

  // Lead ownership permission check:
  // If lead is assigned to another counsellor, non-admin counsellors cannot modify it
  const isAssignedToOtherCounsellor = !isAdmin && Boolean(lead?.assigned_to && lead.assigned_to !== user?.id);

  // Determine which status options are valid for the user
  const currentRank = lead ? LEAD_STATUS_RANKS[lead.status] || 0 : 0;
  const availableStatuses = ALL_STATUSES.filter((s) => {
    if (isAdmin) return true; // Admins can revert or advance
    // Counsellors can only advance or cancel
    if (s.value === 'cancelled') return true;
    const targetRank = LEAD_STATUS_RANKS[s.value];
    return targetRank >= currentRank;
  });

  // 1. Counsellor "Accept Lead" handler
  const handleAcceptLead = async () => {
    if (!lead || !user) return;
    setIsAccepting(true);
    setError('');
    setStatusSuccess('');
    try {
      const updated = await adminLeadsApi.updateLead(lead.id, {
        assigned_to: user.id,
        // Naturally progress pending to contacted when counsellor accepts
        status: lead.status === 'pending' ? 'contacted' : undefined,
      });
      setLead((prev) => (prev ? {
        ...prev,
        ...updated,
        assigned_to: user.id,
        assigned_user_name: user.name || 'You',
        status: lead.status === 'pending' ? 'contacted' : (updated.status || prev.status),
      } : null));
      if (lead.status === 'pending') setSelectedStatus('contacted');
      setSelectedCounsellorId(user.id);
      setStatusSuccess('Lead successfully accepted and assigned to your desk!');
      onLeadUpdated();
      fetchDetails(lead.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to accept lead'));
    } finally {
      setIsAccepting(false);
    }
  };

  // 2. Admin Assignment / Reassignment trigger
  const handleTriggerAssign = () => {
    if (!lead) return;
    // If reassigning a lead that was already assigned to another counsellor, ask for confirmation
    if (lead.assigned_to && selectedCounsellorId !== lead.assigned_to) {
      setShowReassignConfirm(true);
    } else {
      handleExecuteAssignment(selectedCounsellorId);
    }
  };

  const handleExecuteAssignment = async (targetCounsellorId: number | 'unassigned') => {
    if (!lead) return;
    setIsAssigning(true);
    setError('');
    setStatusSuccess('');
    try {
      const newAssignedId = targetCounsellorId === 'unassigned' ? null : Number(targetCounsellorId);
      const updated = await adminLeadsApi.updateLead(lead.id, { assigned_to: newAssignedId });
      const assignedObj = counsellors.find((c) => c.id === newAssignedId);

      setLead((prev) => (prev ? {
        ...prev,
        ...updated,
        assigned_to: newAssignedId,
        assigned_user_name: assignedObj ? assignedObj.name : null,
      } : null));
      setSelectedCounsellorId(targetCounsellorId);
      setShowReassignConfirm(false);
      setStatusSuccess(
        newAssignedId
          ? `Lead successfully assigned to ${assignedObj?.name || 'counsellor'}.`
          : 'Lead unassigned successfully.'
      );
      onLeadUpdated();
      fetchDetails(lead.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update lead assignment'));
      setShowReassignConfirm(false);
    } finally {
      setIsAssigning(false);
    }
  };

  // 3. Status and Scheduling Update handler
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    if (isAssignedToOtherCounsellor) {
      setError(`This lead is assigned to ${lead.assigned_user_name || 'another counsellor'}. You cannot modify it.`);
      return;
    }

    // Backend rule: scheduled status strictly requires scheduled_at
    if (selectedStatus === 'scheduled' && !scheduledAt && !lead.scheduled_at) {
      setError('A scheduled date and time is required when setting status to Demo Scheduled.');
      return;
    }

    // Validate meeting link if provided
    if (meetingLink.trim()) {
      try {
        const parsedUrl = new URL(meetingLink.trim());
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          setError('Meeting link must use http:// or https://');
          return;
        }
      } catch {
        setError('Please enter a valid meeting URL (e.g. https://meet.google.com/abc-defg-hij)');
        return;
      }
    }

    setIsUpdatingStatus(true);
    setError('');
    setStatusSuccess('');

    try {
      const payload: {
        status: LeadStatus;
        scheduled_at?: string | null;
        meeting_link?: string | null;
        follow_up_at?: string | null;
      } = {
        status: selectedStatus,
        meeting_link: meetingLink.trim() || null,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        follow_up_at: followUpAt ? new Date(followUpAt).toISOString() : null,
      };

      const updated = await adminLeadsApi.updateLead(lead.id, payload);
      setLead((prev) => (prev ? { ...prev, ...updated } : null));
      setStatusSuccess('Lead status and schedule updated successfully.');
      onLeadUpdated();
      fetchDetails(lead.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update lead status'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 4. Quick status transitions
  const handleQuickStatus = async (targetStatus: LeadStatus) => {
    if (!lead) return;
    setSelectedStatus(targetStatus);
    if (targetStatus === 'scheduled') {
      // Focus scheduling form without immediate submit
      return;
    }

    setIsUpdatingStatus(true);
    setError('');
    setStatusSuccess('');
    try {
      const updated = await adminLeadsApi.updateLead(lead.id, { status: targetStatus });
      setLead((prev) => (prev ? { ...prev, ...updated } : null));
      setStatusSuccess(`Lead transitioned to ${targetStatus} successfully.`);
      onLeadUpdated();
      fetchDetails(lead.id);
    } catch (err) {
      setError(getErrorMessage(err, `Failed to update status to ${targetStatus}`));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 5. Append internal note handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !noteText.trim()) return;

    if (isAssignedToOtherCounsellor) {
      setNoteError(`This lead is assigned to ${lead.assigned_user_name || 'another counsellor'}. You cannot add notes.`);
      return;
    }

    setIsAddingNote(true);
    setNoteError('');
    try {
      const updated = await adminLeadsApi.addNote(lead.id, noteText.trim());
      setLead((prev) => (prev ? { ...prev, ...updated } : null));
      setNoteText('');
      onLeadUpdated();
      fetchDetails(lead.id);
    } catch (err) {
      setNoteError(getErrorMessage(err, 'Failed to append note'));
    } finally {
      setIsAddingNote(false);
    }
  };

  // 6. Admin Convert to enrollment
  const handleConvertLead = async () => {
    if (!lead) return;
    setIsConverting(true);
    setError('');
    try {
      await adminLeadsApi.convertLead(lead.id);
      setStatusSuccess('Successfully converted demo lead to an active student enrollment!');
      setShowConvertConfirm(false);
      onLeadUpdated();
      fetchDetails(lead.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to convert lead to enrollment'));
      setShowConvertConfirm(false);
    } finally {
      setIsConverting(false);
    }
  };

  // 7. Admin Delete lead
  const handleDeleteLead = async () => {
    if (!lead) return;
    setIsDeleting(true);
    setError('');
    try {
      await adminLeadsApi.deleteLead(lead.id);
      setShowDeleteConfirm(false);
      onLeadUpdated();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete lead'));
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (st: LeadStatus) => {
    switch (st) {
      case 'pending':
        return 'warning';
      case 'contacted':
        return 'accent';
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={lead ? `Lead: ${lead.reference_no}` : 'Lead Details'}
        position="right"
        className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading lead intelligence...</p>
          </div>
        ) : error && !lead ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <p className="font-semibold mb-1">Unable to load lead</p>
            <p>{error}</p>
          </div>
        ) : lead ? (
          <div className="flex flex-col gap-6 pb-8">
            {/* 1. Lead Status & Assignment Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Status & Assignment
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(lead.status)}>
                    {lead.status.toUpperCase()}
                  </Badge>
                  {lead.converted_to_enrollment && (
                    <Badge variant="success">ENROLLED</Badge>
                  )}
                  {lead.assigned_to ? (
                    <Badge
                      variant={lead.assigned_to === user?.id ? 'primary' : 'outline'}
                      className="flex items-center gap-1 font-semibold"
                    >
                      <User className="w-3 h-3" />
                      {lead.assigned_to === user?.id
                        ? 'Assigned to You'
                        : `Assigned: ${lead.assigned_user_name || '#' + lead.assigned_to}`}
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="flex items-center gap-1 font-semibold">
                      <UserPlus className="w-3 h-3" />
                      Unassigned
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500">Inquired On</span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {formatDateKolkata(lead.created_at)}
                </p>
              </div>
            </div>

            {/* Counsellor Quick Accept Banner for Unassigned Leads */}
            {isCounsellor && !lead.assigned_to && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Unassigned Demo Lead
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Accept this student inquiry to assign it to your desk and begin counseling.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleAcceptLead}
                  disabled={isAccepting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1.5 shrink-0 flex items-center gap-1.5 font-bold shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {isAccepting ? 'Accepting...' : 'Accept Lead'}
                </Button>
              </div>
            )}

            {/* Other Counsellor Lead Lock Banner */}
            {isAssignedToOtherCounsellor && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <Lock className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <span className="font-semibold block">Managed by Another Counsellor</span>
                  <span>This inquiry is assigned to {lead.assigned_user_name || 'another staff member'}. Direct modifications and reassignments are restricted to administrators.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {statusSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{statusSuccess}</span>
              </div>
            )}

            {/* 2. Admin Assignment Management Section */}
            {isAdmin && (
              <section className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Lead Assignment Management
                </h4>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-white dark:bg-slate-900">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Assigned Academic Counsellor
                      </label>
                      <select
                        value={selectedCounsellorId}
                        onChange={(e) => {
                          const val = e.target.value === 'unassigned' ? 'unassigned' : Number(e.target.value);
                          setSelectedCounsellorId(val);
                        }}
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="unassigned">-- Unassigned (Available in Pool) --</option>
                        {counsellors.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.email}) {c.status === 'blocked' ? '[Blocked]' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:self-end">
                      <Button
                        type="button"
                        size="sm"
                        disabled={
                          isAssigning ||
                          selectedCounsellorId === (lead.assigned_to || 'unassigned')
                        }
                        onClick={handleTriggerAssign}
                        className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs py-2 px-4 font-semibold"
                      >
                        {isAssigning ? 'Updating...' : 'Save Assignment'}
                      </Button>
                    </div>
                  </div>
                  {lead.assigned_to ? (
                    <p className="text-[11px] text-slate-500">
                      Currently assigned to <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.assigned_user_name || `#${lead.assigned_to}`}</span>.
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      This lead is unassigned and waiting in the counsellor pool.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* 3. Student & Course Prospect Details */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Prospect Information
              </h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {lead.student_name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    Ref: {lead.reference_no}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-2 hover:text-teal-600 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{lead.phone}</span>
                  </a>
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-2 hover:text-teal-600 transition-colors truncate"
                  >
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </a>
                  {lead.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{lead.city}</span>
                    </div>
                  )}
                  {lead.preferred_demo_type && (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-slate-400" />
                      <span className="capitalize">{lead.preferred_demo_type} Demo</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">Course Requested:</span>
                  <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
                    {lead.course_name || `Course #${lead.course_id}`}
                  </p>
                </div>

                {(lead.preferred_date || lead.preferred_time) && (
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    {lead.preferred_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Preferred: {lead.preferred_date}
                      </span>
                    )}
                    {lead.preferred_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Time: {lead.preferred_time}
                      </span>
                    )}
                  </div>
                )}

                {lead.message && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold block mb-1 text-slate-500">Student Inquiry Note:</span>
                    {lead.message}
                  </div>
                )}
              </div>
            </section>

            {/* 4. Workflow & Demo Scheduling Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Workflow & Demo Scheduling
                </h4>
                {/* Quick advance shortcut buttons */}
                {!isAssignedToOtherCounsellor && (
                  <div className="flex items-center gap-1">
                    {lead.status === 'pending' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickStatus('contacted')}
                        disabled={isUpdatingStatus}
                        className="h-7 text-[11px] border-teal-500 text-teal-700 hover:bg-teal-50 font-semibold"
                      >
                        Mark Contacted
                      </Button>
                    )}
                    {lead.status === 'scheduled' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickStatus('completed')}
                        disabled={isUpdatingStatus}
                        className="h-7 text-[11px] border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-semibold"
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleStatusUpdate}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 bg-white dark:bg-slate-900"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Transition Lead Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                    disabled={isAssignedToOtherCounsellor || isUpdatingStatus}
                    className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    {availableStatuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {!isAdmin && !isAssignedToOtherCounsellor && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Counsellors may only advance status forward or cancel. Reverting backward requires an administrator.
                    </p>
                  )}
                </div>

                {/* Scheduling inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Scheduled Date & Time {selectedStatus === 'scheduled' && <span className="text-rose-500">*</span>}
                    </label>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      disabled={isAssignedToOtherCounsellor || isUpdatingStatus}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Follow-up Reminder Date
                    </label>
                    <Input
                      type="datetime-local"
                      value={followUpAt}
                      onChange={(e) => setFollowUpAt(e.target.value)}
                      disabled={isAssignedToOtherCounsellor || isUpdatingStatus}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Live Demo Meeting Link (Google Meet, Zoom, Teams)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://meet.google.com/xyz-abc-def"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      disabled={isAssignedToOtherCounsellor || isUpdatingStatus}
                      className="text-xs"
                    />
                    {meetingLink && (
                      <a
                        href={meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs flex items-center gap-1 shrink-0 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Join
                      </a>
                    )}
                  </div>
                </div>

                {!isAssignedToOtherCounsellor && (
                  <Button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 font-bold"
                  >
                    {isUpdatingStatus ? 'Updating Lead Status & Schedule...' : 'Save Status & Schedule'}
                  </Button>
                )}
              </form>
            </section>

            {/* 5. Counsellor Follow-up Notes & Activity History */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Counselling Notes & Activity Timeline
              </h4>

              {/* Add Note Form */}
              {!isAssignedToOtherCounsellor && (
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Append confidential counselling note (call summary, student preference, follow-up outcome)..."
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  />
                  {noteError && (
                    <p className="text-xs text-rose-600">{noteError}</p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isAddingNote || !noteText.trim()}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-1.5 flex items-center gap-1.5 font-semibold"
                    >
                      <Send className="w-3 h-3" />
                      {isAddingNote ? 'Saving...' : 'Append Internal Note'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Notes Display */}
              {lead.admin_notes && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 whitespace-pre-wrap font-sans">
                  <div className="font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Recorded Counsellor Notes:
                  </div>
                  {lead.admin_notes}
                </div>
              )}

              {/* Activity History Logs */}
              {lead.activity_history && lead.activity_history.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 bg-slate-50/50 dark:bg-slate-900">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Audit Trail:
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lead.activity_history.map((log) => (
                      <div
                        key={log.id}
                        className="text-[11px] p-2 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between text-slate-500 mb-0.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {log.action.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span>{formatDateKolkata(log.created_at)}</span>
                        </div>
                        {log.note && <p className="text-slate-600 dark:text-slate-400">{log.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 6. Admin-Only Management Actions */}
            {isAdmin && (
              <section className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Administrative Operations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {!lead.converted_to_enrollment && (
                    <Button
                      type="button"
                      onClick={() => setShowConvertConfirm(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 font-bold"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Convert to Enrollment
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 text-xs flex items-center gap-1.5 ml-auto font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Lead
                  </Button>
                </div>
              </section>
            )}
          </div>
        ) : null}
      </Drawer>

      {/* Reassign Confirm Dialog */}
      <ConfirmDialog
        isOpen={showReassignConfirm}
        title="Reassign Demo Lead"
        description={`Are you sure you want to reassign lead ${lead?.reference_no} (${lead?.student_name}) from "${lead?.assigned_user_name || 'current counsellor'}" to ${
          selectedCounsellorId === 'unassigned'
            ? 'Unassigned'
            : counsellors.find((c) => c.id === selectedCounsellorId)?.name || 'new counsellor'
        }?`}
        confirmLabel={isAssigning ? 'Reassigning...' : 'Confirm Reassignment'}
        confirmVariant="primary"
        onConfirm={() => handleExecuteAssignment(selectedCounsellorId)}
        onCancel={() => setShowReassignConfirm(false)}
      />

      {/* Convert Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConvertConfirm}
        title="Convert Lead to Student Enrollment"
        description={`Are you sure you want to enroll ${lead?.student_name} into "${lead?.course_name}"? This will create an active student enrollment record and mark the demo lead as completed.`}
        confirmLabel={isConverting ? 'Converting...' : 'Confirm Enrollment'}
        confirmVariant="primary"
        onConfirm={handleConvertLead}
        onCancel={() => setShowConvertConfirm(false)}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Demo Lead"
        description={`Are you sure you want to permanently delete lead ${lead?.reference_no} (${lead?.student_name})? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Lead'}
        confirmVariant="destructive"
        onConfirm={handleDeleteLead}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
