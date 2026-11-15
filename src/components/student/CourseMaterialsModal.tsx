'use client';

import React, { useState, useEffect } from 'react';
import type { CourseMaterial } from '@/types/student';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileCheck,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';

export interface CourseMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: CourseMaterial[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
  courseTitle?: string;
}

export function CourseMaterialsModal({
  isOpen,
  onClose,
  materials,
  isLoading = false,
  onRefresh,
  courseTitle = 'Course',
}: CourseMaterialsModalProps) {
  // Ephemeral in-memory timestamp when current signed URLs were fetched (never persisted)
  const [loadedAt, setLoadedAt] = useState<number>(Date.now());
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);

  // Update ephemeral loadedAt whenever the modal opens or fresh materials are received
  useEffect(() => {
    if (isOpen) {
      setLoadedAt(Date.now());
      setDownloadError(null);
    }
  }, [isOpen, materials]);

  // Check link validity (10-minute HMAC token expiry window)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - loadedAt) / 1000);
      const remaining = Math.max(0, 600 - elapsed);
      setSecondsRemaining(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, loadedAt]);

  const isExpired = secondsRemaining <= 30; // within 30s of expiry or expired
  const isExpiringSoon = secondsRemaining > 30 && secondsRemaining <= 180; // under 3 minutes

  const formatMinutesRemaining = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType?: string | null) => {
    const type = (fileType || '').toLowerCase();
    if (type.includes('pdf')) return FileText;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return FileArchive;
    if (type.includes('csv') || type.includes('xls') || type.includes('sheet')) return FileSpreadsheet;
    if (type.includes('js') || type.includes('py') || type.includes('code')) return FileCode;
    return FileCheck;
  };

  const handleManualRefresh = async () => {
    if (!onRefresh || isRefreshing || isLoading) return;
    setIsRefreshing(true);
    setDownloadError(null);
    try {
      await onRefresh();
      setLoadedAt(Date.now());
    } catch {
      setDownloadError('Failed to refresh secure download tokens. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = async (mat: CourseMaterial) => {
    if (downloadingId !== null) return; // prevent duplicate clicks
    setDownloadingId(mat.id);
    setDownloadError(null);

    try {
      // If links are expired or expiring in under 30s, automatically refresh first if possible
      let activeUrl = mat.download_url;
      if (isExpired && onRefresh) {
        setIsRefreshing(true);
        await onRefresh();
        setLoadedAt(Date.now());
        setIsRefreshing(false);
        // Find updated url from refreshed materials
        const refreshed = materials.find((m) => m.id === mat.id);
        activeUrl = refreshed?.download_url || mat.download_url;
      }

      // Trigger download using temporary anchor
      const link = document.createElement('a');
      link.href = activeUrl;
      link.download = '';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setDownloadError('Download request failed or link expired. Please click "Refresh Links" to generate fresh tokens.');
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
      }, 1200);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Resources &amp; Materials
              </h2>
              {/* Freshness Badge */}
              {isExpired ? (
                <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider">
                  Links Expired
                </Badge>
              ) : isExpiringSoon ? (
                <Badge variant="warning" className="text-[10px] uppercase font-bold tracking-wider">
                  Expires in {formatMinutesRemaining(secondsRemaining)}
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
                  Active ({formatMinutesRemaining(secondsRemaining)})
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download lecture slides, exercises, and supplementary files for {courseTitle}.
            </p>
          </div>

          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isLoading || isRefreshing}
              className="text-xs font-semibold shrink-0 gap-1.5 shadow-xs"
              aria-label="Refresh secure download links"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Links
            </Button>
          )}
        </div>

        {/* Error / Expiry Notice Banner */}
        {downloadError ? (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{downloadError}</span>
            </div>
            {onRefresh && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleManualRefresh}
                disabled={isLoading || isRefreshing}
                className="text-xs shrink-0 py-1 px-2.5 h-auto border-rose-300 text-rose-700 hover:bg-rose-100"
              >
                Refresh Now
              </Button>
            )}
          </div>
        ) : isExpired ? (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Download links have expired after 10 minutes. Click &ldquo;Refresh Links&rdquo; to regenerate tokens.</span>
            </div>
            {onRefresh && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleManualRefresh}
                disabled={isLoading || isRefreshing}
                className="text-xs shrink-0 py-1 px-2.5 h-auto"
              >
                Refresh Links
              </Button>
            )}
          </div>
        ) : null}

        {/* Materials List */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading downloadable materials...
            </div>
          ) : materials.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No Downloadable Files Available
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No supplemental files or slides have been published for this course yet.
              </p>
            </div>
          ) : (
            materials.map((mat) => {
              const Icon = getFileIcon(mat.file_type);
              const isDownloadingThis = downloadingId === mat.id;

              return (
                <div
                  key={mat.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {mat.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="uppercase font-semibold">{mat.file_type || 'FILE'}</span>
                        <span>•</span>
                        <span>{formatFileSize(mat.file_size_bytes)}</span>
                      </div>
                      {mat.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {mat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Secure Download Action with duplicate prevention and auto-refresh */}
                  <Button
                    type="button"
                    size="sm"
                    variant={isExpired ? 'outline' : 'primary'}
                    onClick={() => handleDownload(mat)}
                    disabled={isDownloadingThis || isRefreshing}
                    className="text-xs font-semibold gap-1.5 shrink-0"
                    aria-label={`Download ${mat.title}`}
                  >
                    <Download className={`w-3.5 h-3.5 ${isDownloadingThis ? 'animate-bounce' : ''}`} />
                    {isDownloadingThis ? 'Downloading...' : isExpired ? 'Refresh & Download' : 'Download'}
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Security / Expiration Note */}
        <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Download links are securely signed and authorized for your enrolled account with a 10-minute validity window. If a download link expires, click &ldquo;Refresh Links&rdquo; to generate fresh access tokens without re-authenticating.
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}

export default CourseMaterialsModal;
