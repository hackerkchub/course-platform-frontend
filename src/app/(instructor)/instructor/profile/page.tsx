'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Briefcase,
  Clock,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';
import {
  fetchInstructorProfile,
  updateInstructorProfile,
} from '@/lib/api/instructor-portal';

export default function InstructorProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [designation, setDesignation] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchInstructorProfile();
        setProfile(data);
        setDesignation(data.designation || '');
        setExperienceYears(data.experience_years !== null && data.experience_years !== undefined ? data.experience_years : '');
        setBio(data.bio || '');
        setPhotoUrl(data.photo_url || '');

        const links = data.social_links || {};
        setLinkedin(links.linkedin || '');
        setGithub(links.github || '');
        setTwitter(links.twitter || '');
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load profile details');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);

      const social_links: Record<string, string> = {};
      if (linkedin.trim()) social_links.linkedin = linkedin.trim();
      if (github.trim()) social_links.github = github.trim();
      if (twitter.trim()) social_links.twitter = twitter.trim();

      const updated = await updateInstructorProfile({
        designation: designation.trim() || null,
        experience_years: experienceYears !== '' ? Number(experienceYears) : null,
        bio: bio.trim() || null,
        photo_url: photoUrl.trim() || null,
        social_links: Object.keys(social_links).length > 0 ? social_links : null,
      });

      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Instructor Profile & Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your public instructor profile, bio, credentials, and social links.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        {/* Basic Info Header */}
        <div className="flex items-center gap-4 pb-6 border-b">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={profile?.name || 'Instructor'}
              className="h-20 w-20 rounded-full border-2 border-primary object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {profile?.name?.charAt(0) || 'I'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">{profile?.name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Verified Instructor
            </span>
          </div>
        </div>

        {/* Professional Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Professional Designation</label>
            <div className="relative mt-1">
              <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Lead Machine Learning Engineer"
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Years of Experience</label>
            <div className="relative mt-1">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                min="0"
                max="99"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 8"
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Photo URL */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Profile Photo URL</label>
          <input
            type="text"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Biography & Background</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your teaching philosophy, industry experience, and milestones..."
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-foreground">Social & Professional Links</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">LinkedIn</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">GitHub</label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Twitter / X</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/..."
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
