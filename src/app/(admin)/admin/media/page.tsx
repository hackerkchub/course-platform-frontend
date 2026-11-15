'use client';

import React, { useState } from 'react';
import { DashboardHeading, DashboardSection } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/utils';
import {
  Copy,
  Trash2,
  Check,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Package,
  UploadCloud,
  File as FileIcon,
} from 'lucide-react';

export type UploadPurpose = 'image' | 'document' | 'material';

interface UploadedMediaItem {
  url: string;
  filename: string;
  size: number;
  purpose: UploadPurpose;
  uploadedAt: string;
}

const PURPOSE_CONFIG: Record<
  UploadPurpose,
  {
    title: string;
    description: string;
    maxBytes: number;
    maxSizeLabel: string;
    allowedExts: string[];
    acceptAttr: string;
  }
> = {
  image: {
    title: 'Image Asset',
    description: 'Course banners, thumbnails, instructor headshots (Public)',
    maxBytes: 2 * 1024 * 1024,
    maxSizeLabel: '2 MB',
    allowedExts: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptAttr: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
  },
  document: {
    title: 'Document (PDF)',
    description: 'Course syllabus, public brochures, informational guides (Public)',
    maxBytes: 10 * 1024 * 1024,
    maxSizeLabel: '10 MB',
    allowedExts: ['.pdf'],
    acceptAttr: '.pdf,application/pdf',
  },
  material: {
    title: 'Course Material',
    description: 'Lesson worksheets, project archives, offline downloads (Private)',
    maxBytes: 10 * 1024 * 1024,
    maxSizeLabel: '10 MB',
    allowedExts: ['.pdf', '.zip', '.docx', '.xlsx', '.mp4'],
    acceptAttr: '.pdf,.zip,.docx,.xlsx,.mp4',
  },
};

export default function AdminMediaPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [purpose, setPurpose] = useState<UploadPurpose>('image');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploadedItems, setUploadedItems] = useState<UploadedMediaItem[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  const validateSelectedFile = (file: File, targetPurpose: UploadPurpose): string | null => {
    const config = PURPOSE_CONFIG[targetPurpose];
    const name = file.name.toLowerCase();
    const hasValidExt = config.allowedExts.some((ext) => name.endsWith(ext));

    if (!hasValidExt) {
      return `Invalid file type for ${config.title}. Allowed extensions: ${config.allowedExts.join(', ')}`;
    }

    if (file.size > config.maxBytes) {
      return `File size exceeds the maximum allowed limit of ${config.maxSizeLabel} for ${config.title}`;
    }

    return null;
  };

  const handlePurposeChange = (newPurpose: UploadPurpose) => {
    setPurpose(newPurpose);
    setError('');
    setSuccess('');
    if (selectedFile) {
      const validationError = validateSelectedFile(selectedFile, newPurpose);
      if (validationError) {
        setError(validationError);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setError('');
      setSuccess('');
      const validationError = validateSelectedFile(file, purpose);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const validationError = validateSelectedFile(selectedFile, purpose);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('purpose', purpose);

      const res = await apiClient.post(API_ENDPOINTS.uploads.adminUpload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success && res.data?.data) {
        const fileUrl = res.data.data.path || res.data.data.file_url || res.data.data.url;
        const newItem: UploadedMediaItem = {
          url: fileUrl,
          filename: selectedFile.name,
          size: res.data.data.file_size_bytes || selectedFile.size,
          purpose,
          uploadedAt: new Date().toISOString(),
        };

        setUploadedItems((prev) => [newItem, ...prev]);
        setSuccess(`File "${selectedFile.name}" uploaded successfully for purpose: ${purpose}.`);
        setSelectedFile(null);
      } else {
        throw new Error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload media file'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const handleDeleteItem = (url: string) => {
    setUploadedItems((prev) => prev.filter((item) => item.url !== url));
  };

  const activeConfig = PURPOSE_CONFIG[purpose];

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumbs
        items={[
          { label: 'Admin Center', href: '/admin/dashboard' },
          { label: 'Media Library' },
        ]}
      />

      <DashboardHeading
        title="Media & Assets Storage"
        subtitle="Upload course banners, lesson resources, instructor headshots, and marketing collateral."
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Purpose Selector */}
      <DashboardSection
        title="1. Select Upload Purpose"
        subtitle="Backend storage location, access controls, and file validation rules depend on the chosen purpose."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['image', 'document', 'material'] as UploadPurpose[]).map((pKey) => {
            const cfg = PURPOSE_CONFIG[pKey];
            const isSelected = purpose === pKey;
            return (
              <button
                type="button"
                key={pKey}
                onClick={() => handlePurposeChange(pKey)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-600/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {pKey === 'image' && <ImageIcon className="w-4 h-4 text-teal-600" />}
                    {pKey === 'document' && <FileText className="w-4 h-4 text-sky-600" />}
                    {pKey === 'material' && <Package className="w-4 h-4 text-amber-600" />}
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {cfg.title}
                    </span>
                  </div>
                  <Badge variant={isSelected ? 'success' : 'default'} className="text-[10px]">
                    Max {cfg.maxSizeLabel}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {cfg.description}
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  {cfg.allowedExts.join(', ')}
                </div>
              </button>
            );
          })}
        </div>
      </DashboardSection>

      {/* Upload Zone */}
      <DashboardSection
        title="2. Direct File Upload"
        subtitle={`Selected purpose: ${activeConfig.title}. Limit: ${activeConfig.maxSizeLabel}.`}
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-teal-500 transition-colors">
            <UploadCloud className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : `Choose a ${activeConfig.title} file or drag & drop`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Permitted formats: {activeConfig.allowedExts.join(', ')} (Max {activeConfig.maxSizeLabel})
            </p>

            <input
              type="file"
              id="file-upload"
              accept={activeConfig.acceptAttr}
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-block px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Browse {activeConfig.title} Files
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-2 text-xs text-teal-900 dark:text-teal-200">
                <FileIcon className="w-4 h-4 text-teal-600" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-slate-500">
                  ({Math.round(selectedFile.size / 1024)} KB)
                </span>
                <Badge variant="accent" className="text-[10px] uppercase">
                  purpose: {purpose}
                </Badge>
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={isUploading}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
              >
                {isUploading ? 'Uploading...' : 'Confirm Upload'}
              </Button>
            </div>
          )}
        </form>
      </DashboardSection>

      {/* Uploaded History in Current Session */}
      {uploadedItems.length > 0 && (
        <DashboardSection
          title="Recently Uploaded Assets"
          subtitle="Copy permanent URLs for use in course thumbnails, curriculum lessons, or syllabus downloads."
        >
          <div className="space-y-3">
            {uploadedItems.map((item) => (
              <div
                key={item.url}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {item.purpose === 'image' && <ImageIcon className="w-5 h-5 text-teal-600" />}
                    {item.purpose === 'document' && <FileText className="w-5 h-5 text-sky-600" />}
                    {item.purpose === 'material' && <Package className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.filename}
                      </span>
                      <Badge variant="default" className="text-[10px] uppercase">
                        {item.purpose}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {Math.round(item.size / 1024)} KB
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono truncate text-[11px] mt-0.5">
                      {item.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(item.url)}
                    className="text-xs flex items-center gap-1"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteItem(item.url)}
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      )}
    </div>
  );
}
