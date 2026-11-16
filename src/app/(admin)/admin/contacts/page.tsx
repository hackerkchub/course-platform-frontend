'use client';

import React, { useEffect, useState } from 'react';
import {
  Mail,
  Search,
  Filter,
  UserCheck,
  CheckCircle,
  Clock,
  MessageSquare,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react';
import {
  fetchAdminContacts,
  fetchAdminContactById,
  updateAdminContactStatus,
  assignAdminContact,
  type ContactMessageItem,
} from '@/lib/api/contact';
import { getAdminCounsellors } from '@/lib/api/admin-counsellors';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactMessageItem[]>([]);
  const [counsellors, setCounsellors] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail / Action modal
  const [activeContact, setActiveContact] = useState<ContactMessageItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('in_progress');
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const [contactRes, counsellorsRes] = await Promise.all([
        fetchAdminContacts({
          status: statusFilter,
          search: search.trim() || undefined,
        }),
        getAdminCounsellors({ limit: 100 }).catch(() => ({ counsellors: [], items: [] } as any)),
      ]);

      setContacts(contactRes.contacts || []);
      setTotal(contactRes.total || 0);
      const cList = counsellorsRes.counsellors || counsellorsRes.items || [];
      setCounsellors(cList);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load contact messages');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadData();
  }

  async function handleSaveContact() {
    if (!activeContact) return;
    try {
      setIsUpdating(true);
      await Promise.all([
        updateAdminContactStatus(activeContact.id, {
          status: newStatus,
          admin_notes: adminNotes.trim() || undefined,
        }),
        assignAdminContact(activeContact.id, assignedTo !== '' ? Number(assignedTo) : null),
      ]);
      setActiveContact(null);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update contact inquiry');
    } finally {
      setIsUpdating(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200';
      case 'responded':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200';
      case 'closed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Contact Inquiries Desk</h1>
          <p className="text-sm text-muted-foreground">
            Manage prospective student contact submissions and assign admissions staff.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-60 rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No Contact Inquiries</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? 'No inquiries matching your search query.' : 'No contact messages have been received yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Subject & Message</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Assigned Staff</th>
                  <th className="px-6 py-3.5">Received</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-medium text-foreground truncate">{c.subject}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{c.message}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(c.status)}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {c.assigned_to_name ? (
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{c.assigned_to_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setActiveContact(c);
                          setNewStatus(c.status);
                          setAdminNotes(c.admin_notes || '');
                          setAssignedTo(c.assigned_to || '');
                        }}
                        className="rounded-md border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Manage Contact */}
      {activeContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Manage Contact Inquiry</h3>

            <div className="rounded-lg bg-muted/40 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">{activeContact.name}</span>
                <span className="text-muted-foreground">{activeContact.email} • {activeContact.phone}</span>
              </div>
              <p className="font-medium text-foreground">Subject: {activeContact.subject}</p>
              <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground">
                {activeContact.message}
              </blockquote>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Assign Staff / Counsellor</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Internal Notes / Log</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record call summary, resolution notes..."
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveContact(null)}
                className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveContact}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
