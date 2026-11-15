'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  User,
  AlertCircle,
  Briefcase,
  Globe,
  Loader2,
  Trash2,
} from 'lucide-react';
import { LinkedinIcon, TwitterIcon, GithubIcon } from '@/components/ui/social-icons';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  createAdminInstructor,
  updateAdminInstructor,
  uploadInstructorPhoto,
  MAX_PHOTO_BYTES,
  ALLOWED_IMAGE_EXTENSIONS,
} from '@/lib/api/instructor';
import type {
  Instructor,
  CreateInstructorPayload,
  UpdateInstructorPayload,
  InstructorStatus,
} from '@/types/instructor';

interface InstructorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  instructor?: Instructor | null;
}

interface FormErrors {
  name?: string;
  designation?: string;
  experience_years?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  general?: string;
}

function isValidHttpUrl(string: string) {
  if (!string || !string.trim()) return true;
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function InstructorFormModal({
  isOpen,
  onClose,
  onSuccess,
  instructor,
}: InstructorFormModalProps) {
  const isEditMode = Boolean(instructor?.id);

  // Form Fields
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [experienceYears, setExperienceYears] = useState<string>('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState<InstructorStatus>('active');

  // Social Links
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');

  // UI States
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form on edit / reset on new
  useEffect(() => {
    if (isOpen) {
      if (instructor) {
        setName(instructor.name || '');
        setDesignation(instructor.designation || '');
        setExperienceYears(
          instructor.experience_years !== null && instructor.experience_years !== undefined
            ? String(instructor.experience_years)
            : ''
        );
        setBio(instructor.bio || '');
        setPhotoUrl(instructor.photo_url || '');
        setStatus(instructor.status || 'active');
        setLinkedin(instructor.social_links?.linkedin || '');
        setTwitter(instructor.social_links?.twitter || '');
        setGithub(instructor.social_links?.github || '');
        setWebsite(instructor.social_links?.website || '');
      } else {
        setName('');
        setDesignation('');
        setExperienceYears('');
        setBio('');
        setPhotoUrl('');
        setStatus('active');
        setLinkedin('');
        setTwitter('');
        setGithub('');
        setWebsite('');
      }
      setErrors({});
      setUploadError(null);
    }
  }, [isOpen, instructor]);

  // Handle Photo File Selection & Upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate size (2 MB)
    if (file.size > MAX_PHOTO_BYTES) {
      setUploadError('Image size exceeds 2 MB limit.');
      return;
    }

    // Validate extension
    const lowerName = file.name.toLowerCase();
    const isValidExt = ALLOWED_IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (!isValidExt) {
      setUploadError('Please select a valid image format (.jpg, .jpeg, .png, .webp).');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const uploadedUrl = await uploadInstructorPhoto(file);
      setPhotoUrl(uploadedUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed. Please try again.';
      setUploadError(msg);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setUploadError(null);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      nextErrors.name = 'Instructor name is required.';
    } else if (trimmedName.length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    } else if (trimmedName.length > 150) {
      nextErrors.name = 'Name must not exceed 150 characters.';
    }

    if (designation && designation.trim().length > 150) {
      nextErrors.designation = 'Designation must not exceed 150 characters.';
    }

    if (experienceYears.trim() !== '') {
      const expNum = Number(experienceYears);
      if (isNaN(expNum) || expNum < 0 || expNum > 99) {
        nextErrors.experience_years = 'Experience must be a number between 0 and 99 years.';
      }
    }

    // URL validations
    if (linkedin.trim() && !isValidHttpUrl(linkedin)) {
      nextErrors.linkedin = 'Enter a valid URL (starting with http:// or https://)';
    }
    if (twitter.trim() && !isValidHttpUrl(twitter)) {
      nextErrors.twitter = 'Enter a valid URL (starting with http:// or https://)';
    }
    if (github.trim() && !isValidHttpUrl(github)) {
      nextErrors.github = 'Enter a valid URL (starting with http:// or https://)';
    }
    if (website.trim() && !isValidHttpUrl(website)) {
      nextErrors.website = 'Enter a valid URL (starting with http:// or https://)';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isUploadingPhoto) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    const socialLinksObj: Record<string, string> = {};
    if (linkedin.trim()) socialLinksObj.linkedin = linkedin.trim();
    if (twitter.trim()) socialLinksObj.twitter = twitter.trim();
    if (github.trim()) socialLinksObj.github = github.trim();
    if (website.trim()) socialLinksObj.website = website.trim();

    const payload: CreateInstructorPayload | UpdateInstructorPayload = {
      name: name.trim(),
      designation: designation.trim() || null,
      experience_years: experienceYears.trim() !== '' ? Number(experienceYears) : null,
      bio: bio.trim() || null,
      photo_url: photoUrl.trim() || null,
      social_links: Object.keys(socialLinksObj).length > 0 ? socialLinksObj : null,
      status,
    };

    try {
      if (isEditMode && instructor) {
        await updateAdminInstructor(instructor.id, payload);
      } else {
        await createAdminInstructor(payload as CreateInstructorPayload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to save instructor profile. Please check the values and try again.';
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      className="max-w-2xl p-6 sm:p-8"
      title={isEditMode ? 'Edit Instructor Profile' : 'Add New Instructor'}
      description={
        isEditMode
          ? 'Update faculty credentials, biography, and public profile details.'
          : 'Register a new industry practitioner to lead platform cohorts and courses.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {/* General API Error Banner */}
        {errors.general && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-800 text-xs sm:text-sm border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Photo Upload Section */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Profile Photo
          </label>
          <div className="flex items-center gap-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* Avatar Preview */}
            <div className="relative shrink-0">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={name || 'Instructor preview'}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                  {name ? name.charAt(0).toUpperCase() : <User className="w-8 h-8 opacity-80" />}
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
                disabled={isUploadingPhoto || isSubmitting}
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto || isSubmitting}
                  className="gap-1.5 text-xs font-semibold"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      {photoUrl ? 'Replace Photo' : 'Upload Photo'}
                    </>
                  )}
                </Button>

                {photoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto || isSubmitting}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Recommended 400×400px. JPG, PNG or WEBP up to 2 MB.
              </p>

              {uploadError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-0.5">
                  {uploadError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Primary Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instructor Name */}
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Instructor Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Jane Doe or Alex Smith"
              maxLength={150}
              className={`w-full h-10 px-3.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-600'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>

          {/* Designation */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Professional Designation
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Staff Distributed Systems Engineer"
              maxLength={150}
              className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
            />
            {errors.designation && (
              <p className="text-xs text-red-500 font-medium">{errors.designation}</p>
            )}
          </div>

          {/* Experience Years */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Experience (Years)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                max="99"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 10"
                className={`w-full h-10 px-3.5 pl-9 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.experience_years
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-blue-600'
                }`}
              />
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            {errors.experience_years && (
              <p className="text-xs text-red-500 font-medium">{errors.experience_years}</p>
            )}
          </div>
        </div>

        {/* Bio Textarea */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Professional Biography
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Highlight engineering background, major systems designed, tech stacks, and cohort teaching experience..."
            className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors leading-relaxed resize-y"
          />
        </div>

        {/* Social Links Section */}
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Social Profiles & Portfolio
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* LinkedIn */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="w-4 h-4 text-blue-600 absolute left-2.5 top-2.5 pointer-events-none">
                  <LinkedinIcon className="w-4 h-4" />
                </div>
              </div>
              {errors.linkedin && (
                <p className="text-[11px] text-red-500 font-medium">{errors.linkedin}</p>
              )}
            </div>

            {/* Twitter */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="w-4 h-4 text-sky-500 absolute left-2.5 top-2.5 pointer-events-none">
                  <TwitterIcon className="w-4 h-4" />
                </div>
              </div>
              {errors.twitter && (
                <p className="text-[11px] text-red-500 font-medium">{errors.twitter}</p>
              )}
            </div>

            {/* GitHub */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="w-4 h-4 text-slate-700 dark:text-slate-300 absolute left-2.5 top-2.5 pointer-events-none">
                  <GithubIcon className="w-4 h-4" />
                </div>
              </div>
              {errors.github && (
                <p className="text-[11px] text-red-500 font-medium">{errors.github}</p>
              )}
            </div>

            {/* Personal Website */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Globe className="w-4 h-4 text-emerald-600 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
              {errors.website && (
                <p className="text-[11px] text-red-500 font-medium">{errors.website}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status Selection */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Profile Status
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="status"
                value="active"
                checked={status === 'active'}
                onChange={() => setStatus('active')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Active (Eligible for public faculty directory)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={status === 'inactive'}
                onChange={() => setStatus('inactive')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Inactive</span>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isUploadingPhoto}
            className="text-xs font-semibold gap-1.5 min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Create Instructor'
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
export default InstructorFormModal;
