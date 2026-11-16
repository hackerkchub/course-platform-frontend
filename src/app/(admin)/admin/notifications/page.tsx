'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
} from 'lucide-react';
import {
  fetchNotificationSettings,
  updateNotificationSetting,
  fetchNotificationLogs,
  retryNotificationLog,
  type NotificationSettingItem,
  type NotificationLogItem,
} from '@/lib/api/notifications';

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');

  // Settings state
  const [settings, setSettings] = useState<NotificationSettingItem[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [updatingEventType, setUpdatingEventType] = useState<string | null>(null);

  // Logs state
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [retryingId, setRetryingId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function loadSettings() {
    try {
      setIsLoadingSettings(true);
      setError(null);
      const data = await fetchNotificationSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load notification settings');
    } finally {
      setIsLoadingSettings(false);
    }
  }

  async function loadLogs() {
    try {
      setIsLoadingLogs(true);
      setError(null);
      const res = await fetchNotificationLogs({
        channel: channelFilter,
        status: statusFilter,
      });
      setLogs(res.logs || []);
      setLogsTotal(res.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load delivery logs');
    } finally {
      setIsLoadingLogs(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    } else {
      loadLogs();
    }
  }, [activeTab, channelFilter, statusFilter]);

  async function handleToggle(setting: NotificationSettingItem, key: keyof NotificationSettingItem) {
    try {
      setUpdatingEventType(setting.event_type);
      const updatedVal = !setting[key];
      const res = await updateNotificationSetting(setting.event_type, {
        [key]: updatedVal,
      });

      setSettings(prev => prev.map(s => s.event_type === setting.event_type ? res : s));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update setting');
    } finally {
      setUpdatingEventType(null);
    }
  }

  async function handleRetry(logId: number) {
    try {
      setRetryingId(logId);
      await retryNotificationLog(logId);
      await loadLogs();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to retry notification');
    } finally {
      setRetryingId(null);
    }
  }

  function formatEventName(type: string) {
    return type
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Centralized Notifications Hub</h1>
          <p className="text-sm text-muted-foreground">
            Configure delivery channels, recipient matrices, and monitor multi-channel notification logs.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-lg border bg-muted p-1">
          <button
            onClick={() => setActiveTab('settings')}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Settings Matrix
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'logs'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Delivery Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* TAB 1: SETTINGS MATRIX */}
      {activeTab === 'settings' && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {isLoadingSettings ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Business Event</th>
                    <th className="px-4 py-4 text-center">Email</th>
                    <th className="px-4 py-4 text-center">WhatsApp</th>
                    <th className="px-4 py-4 text-center">In-App</th>
                    <th className="px-4 py-4 text-center">Super Admin</th>
                    <th className="px-4 py-4 text-center">Counsellor</th>
                    <th className="px-4 py-4 text-center">Instructor</th>
                    <th className="px-4 py-4 text-center">Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {settings.map((s) => {
                    const isBusy = updatingEventType === s.event_type;
                    return (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{formatEventName(s.event_type)}</div>
                          <div className="text-xs text-muted-foreground font-mono">{s.event_type}</div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            disabled={isBusy}
                            checked={Boolean(s.email_enabled)}
                            onChange={() => handleToggle(s, 'email_enabled')}
                            className="h-4 w-4 rounded border text-primary focus:ring-primary"
                          />
                        </td>

                        {/* WhatsApp */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            disabled={isBusy}
                            checked={Boolean(s.whatsapp_enabled)}
                            onChange={() => handleToggle(s, 'whatsapp_enabled')}
                            className="h-4 w-4 rounded border text-primary focus:ring-primary"
                          />
                        </td>

                        {/* In-App */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            disabled={isBusy}
                            checked={Boolean(s.inapp_enabled)}
                            onChange={() => handleToggle(s, 'inapp_enabled')}
                            className="h-4 w-4 rounded border text-primary focus:ring-primary"
                          />
                        </td>

                        {/* Super Admin */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            disabled={isBusy}
                            checked={Boolean(s.notify_super_admin)}
                            onChange={() => handleToggle(s, 'notify_super_admin')}
                            className="h-4 w-4 rounded border text-primary focus:ring-primary"
                          />
                        </td>

                        {/* Counsellor */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            disabled={isBusy}
                            checked={Boolean(s.notify_counsellor)}
                            onChange={() => handleToggle(s, 'notify_counsellor')}
                            className="h-4 w-4 rounded border text-primary focus:ring-primary"
                          />
                        </td>

                        {/* Instructor */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            disabled={isBusy}
                            checked={Boolean(s.notify_instructor)}
                            onChange={() => handleToggle(s, 'notify_instructor')}
                            className="h-4 w-4 rounded border text-primary focus:ring-primary"
                          />
                        </td>

                        {/* Student */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            disabled={isBusy}
                            checked={Boolean(s.notify_student)}
                            onChange={() => handleToggle(s, 'notify_student')}
                            className="h-4 w-4 rounded border text-primary focus:ring-primary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DELIVERY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Channel:</span>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="h-8 rounded-md border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Channels</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="inapp">In-App</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-md border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="queued">Queued</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <button
              onClick={loadLogs}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>

          {/* Logs Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            {isLoadingLogs ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No Delivery Logs Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Notifications triggered by system events will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3.5">ID / Channel</th>
                      <th className="px-6 py-3.5">Recipient</th>
                      <th className="px-6 py-3.5">Event Type</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">#{log.id}</div>
                          <span className={`inline-block mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            log.channel === 'email'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                              : log.channel === 'whatsapp'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                          }`}>
                            {log.channel}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{log.recipient}</div>
                          {log.idempotency_key && (
                            <div className="text-[10px] text-muted-foreground truncate max-w-xs">
                              {log.idempotency_key}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs">
                          <div className="font-medium text-foreground">{log.event_type || log.type}</div>
                          {log.template_name && (
                            <div className="text-muted-foreground">tpl: {log.template_name}</div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            log.status === 'sent'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : log.status === 'failed'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : log.status === 'processing'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                          {log.error_message && (
                            <div className="text-[10px] text-rose-600 mt-1 max-w-xs truncate" title={log.error_message}>
                              {log.error_message}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {log.sent_at
                            ? new Date(log.sent_at).toLocaleString()
                            : new Date(log.created_at).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {log.status === 'failed' && (
                            <button
                              disabled={retryingId === log.id}
                              onClick={() => handleRetry(log.id)}
                              className="rounded-md border bg-background px-2.5 py-1 text-xs font-semibold text-primary hover:bg-muted disabled:opacity-50"
                            >
                              {retryingId === log.id ? 'Retrying...' : 'Retry'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
