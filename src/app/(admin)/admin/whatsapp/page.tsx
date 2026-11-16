'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getErrorMessage } from '@/lib/utils';
import {
  MessageCircle,
  Plus,
  Search,
  Star,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Phone,
  BookOpen,
} from 'lucide-react';
import {
  getWhatsAppContacts,
  createWhatsAppContact,
  updateWhatsAppContact,
  setDefaultWhatsAppContact,
  updateWhatsAppContactStatus,
  deleteWhatsAppContact,
  getWhatsAppPreview,
} from '@/lib/api/admin-whatsapp';
import type { WhatsAppContact, WhatsAppContactFormData, WhatsAppPreviewResponse } from '@/types/whatsapp';

const DEPARTMENTS = [
  { value: 'admissions', label: 'Admissions Desk' },
  { value: 'counselling', label: 'Student Counselling' },
  { value: 'support', label: 'Technical & Academic Support' },
  { value: 'placements', label: 'Career & Placements' },
  { value: 'general', label: 'General Enquiries' },
];

export default function AdminWhatsAppDeskPage() {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<WhatsAppContact | null>(null);
  const [formData, setFormData] = useState<WhatsAppContactFormData>({
    display_name: '',
    department: 'admissions',
    country_code: '+91',
    phone_number: '',
    is_active: true,
    is_default: false,
    custom_message_template: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Preview & Test Chat Modal
  const [previewContact, setPreviewContact] = useState<WhatsAppContact | null>(null);
  const [previewData, setPreviewData] = useState<WhatsAppPreviewResponse | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Delete confirmation
  const [contactToDelete, setContactToDelete] = useState<WhatsAppContact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action busy indicators
  const [actionId, setActionId] = useState<number | null>(null);

  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getWhatsAppContacts({
        search: search.trim() || undefined,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        is_active: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setContacts(res.data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load WhatsApp contacts'));
    } finally {
      setIsLoading(false);
    }
  }, [search, departmentFilter, statusFilter]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadContacts();
  }

  function openCreateModal() {
    setEditingContact(null);
    setFormData({
      display_name: '',
      department: 'admissions',
      country_code: '+91',
      phone_number: '',
      is_active: true,
      is_default: contacts.length === 0, // default if first contact
      custom_message_template: '',
      notes: '',
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditModal(c: WhatsAppContact) {
    setEditingContact(c);
    setFormData({
      display_name: c.display_name,
      department: c.department,
      country_code: c.country_code || '+91',
      phone_number: c.phone_number,
      is_active: c.is_active,
      is_default: c.is_default,
      custom_message_template: c.custom_message_template || '',
      notes: c.notes || '',
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.display_name.trim()) {
      setFormError('Display name is required');
      return;
    }
    if (!formData.phone_number.trim()) {
      setFormError('Phone number is required');
      return;
    }

    try {
      setIsSaving(true);
      if (editingContact) {
        await updateWhatsAppContact(editingContact.id, formData);
        setSuccessMsg(`WhatsApp contact "${formData.display_name}" updated successfully.`);
      } else {
        await createWhatsAppContact(formData);
        setSuccessMsg(`New WhatsApp contact "${formData.display_name}" created successfully.`);
      }
      setIsFormOpen(false);
      loadContacts();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Failed to save WhatsApp contact'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSetDefault(c: WhatsAppContact) {
    try {
      setActionId(c.id);
      setError(null);
      await setDefaultWhatsAppContact(c.id);
      setSuccessMsg(`"${c.display_name}" is now designated as the Global Default WhatsApp Line.`);
      await loadContacts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to set default contact'));
    } finally {
      setActionId(null);
    }
  }

  async function handleToggleStatus(c: WhatsAppContact) {
    try {
      setActionId(c.id);
      setError(null);
      await updateWhatsAppContactStatus(c.id, !c.is_active);
      setSuccessMsg(`Contact "${c.display_name}" status updated to ${!c.is_active ? 'Active' : 'Inactive'}.`);
      await loadContacts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update contact status'));
    } finally {
      setActionId(null);
    }
  }

  async function openPreview(c: WhatsAppContact) {
    setPreviewContact(c);
    setPreviewData(null);
    setIsPreviewLoading(true);
    setCopiedUrl(false);
    try {
      const data = await getWhatsAppPreview(c.id);
      setPreviewData(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to generate preview'));
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function confirmDelete() {
    if (!contactToDelete) return;
    try {
      setIsDeleting(true);
      setError(null);
      await deleteWhatsAppContact(contactToDelete.id);
      setSuccessMsg(`Contact "${contactToDelete.display_name}" deleted successfully.`);
      setContactToDelete(null);
      await loadContacts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete contact'));
    } finally {
      setIsDeleting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  // Insert template placeholder token
  function insertToken(token: string) {
    setFormData(prev => ({
      ...prev,
      custom_message_template: `${prev.custom_message_template || ''} {{${token}}} `,
    }));
  }

  // Summary counts
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(c => c.is_active).length;
  const defaultContact = contacts.find(c => c.is_default);
  const totalAssignments = contacts.reduce((sum, c) => sum + (c.assigned_courses_count || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            WhatsApp Desk & Admissions Routing
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Centrally manage official WhatsApp phone lines, department routing, global fallback defaults, and custom message templates.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add WhatsApp Line
        </button>
      </div>

      {/* Notifications / Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between text-red-800 dark:text-red-300 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Total Phone Lines</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalContacts}</span>
            <span className="text-xs text-slate-500">configured</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Active Lines</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{activeContacts}</span>
            <span className="text-xs text-slate-500">of {totalContacts} available</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Global Default Line</span>
          <div className="mt-1">
            {defaultContact ? (
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{defaultContact.display_name}</p>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">+{defaultContact.normalized_phone}</p>
              </div>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">None Designated</span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Course Mappings</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{totalAssignments}</span>
            <span className="text-xs text-slate-500">custom routed courses</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <button
            onClick={() => loadContacts()}
            disabled={isLoading}
            className="p-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-sm">Loading WhatsApp lines...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-16 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No WhatsApp Lines Configured</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Add your official admissions or department mobile number to activate click-to-chat on course landing pages.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Number
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Line & Department</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Routing Role</th>
                  <th className="py-3 px-4 text-center">Assigned Courses</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {contacts.map(c => {
                  const deptObj = DEPARTMENTS.find(d => d.value === c.department);
                  const isActionBusy = actionId === c.id;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Name & Dept */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{c.display_name}</div>
                        <div className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {deptObj ? deptObj.label : c.department}
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-900 dark:text-white font-medium flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.country_code} {c.phone_number}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">wa.me/{c.normalized_phone}</span>
                      </td>

                      {/* Routing Role */}
                      <td className="py-3.5 px-4">
                        {c.is_default ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                            Global Default
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(c)}
                            disabled={isActionBusy || !c.is_active}
                            className="text-xs text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium inline-flex items-center gap-1 disabled:opacity-40"
                            title={c.is_active ? 'Make this the default fallback for all courses' : 'Activate line first to set as default'}
                          >
                            <Star className="w-3 h-3" />
                            Set as Default
                          </button>
                        )}
                      </td>

                      {/* Assigned Courses */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          <BookOpen className="w-3 h-3" />
                          {c.assigned_courses_count || 0}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          disabled={isActionBusy || (c.is_default && c.is_active)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                            c.is_active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          } ${c.is_default && c.is_active ? 'cursor-not-allowed opacity-80' : 'hover:opacity-80'}`}
                          title={c.is_default && c.is_active ? 'Global default line cannot be deactivated directly' : 'Click to toggle active status'}
                        >
                          {c.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPreview(c)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Preview Click-to-Chat Link & Message"
                          >
                            <ExternalLink className="w-4 h-4 text-emerald-600" />
                          </button>

                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Edit Contact"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>

                          <button
                            onClick={() => setContactToDelete(c)}
                            disabled={c.is_default}
                            className={`p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 ${
                              c.is_default ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title={c.is_default ? 'Default contact cannot be deleted' : 'Delete Contact'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              {editingContact ? 'Edit WhatsApp Number' : 'Add Official WhatsApp Line'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter the official mobile number. For Indian numbers, provide the standard 10-digit mobile number.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Admissions Line or SoftMax Desk"
                  value={formData.display_name}
                  onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91"
                    value={formData.country_code}
                    onChange={e => setFormData({ ...formData, country_code: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number * (10 Digits for India)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone_number}
                  onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Will be automatically normalized to E.164 without leading + (e.g. 919876543210) for wa.me links.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Custom Message Template (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400">Click to insert token:</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => insertToken('course_name')}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 dark:border-slate-700"
                  >
                    + {'{{course_name}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken('course_code')}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 dark:border-slate-700"
                  >
                    + {'{{course_code}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken('course_url')}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 dark:border-slate-700"
                  >
                    + {'{{course_url}}'}
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder="Hi SoftMax Admissions, I would like more information about {{course_name}} (Code: {{course_code}}). Link: {{course_url}}"
                  value={formData.custom_message_template || ''}
                  onChange={e => setFormData({ ...formData, custom_message_template: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Administrative Notes (Internal)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary phone assigned to Admissions Desk 1"
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Line is Active (enables WhatsApp routing for assigned courses)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Designate as Global Default Line (all courses without specific assignments will route here)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingContact ? 'Save Changes' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview & Test Chat Modal */}
      {previewContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                Live WhatsApp Preview & Test
              </h3>
              <button
                onClick={() => setPreviewContact(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {isPreviewLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                <p className="text-xs">Generating click-to-chat preview...</p>
              </div>
            ) : previewData ? (
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Target Line</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {previewData.display_name} (+{previewData.normalized_phone})
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pre-filled Message Preview</span>
                  <div className="mt-1 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                    {previewData.interpolated_message}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Click-to-Chat URL</span>
                  <div className="mt-1 flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all">
                    <span className="truncate">{previewData.click_to_chat_url}</span>
                    <button
                      onClick={() => copyToClipboard(previewData.click_to_chat_url)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
                      title="Copy URL"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Test opens wa.me link directly</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewContact(null)}
                      className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                      Close
                    </button>
                    <a
                      href={previewData.click_to_chat_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Test in WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Confirm Delete WhatsApp Line
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">&quot;{contactToDelete.display_name}&quot;</span>?
            </p>
            {contactToDelete.assigned_courses_count ? (
              <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 mt-2">
                Warning: {contactToDelete.assigned_courses_count} course(s) are currently assigned to this number. Deleting it will cause those courses to automatically fallback to the Global Default line.
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Line
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
