'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { DashboardHeading } from '@/components/dashboard/DashboardHeading';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDateKolkata, getErrorMessage } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Shield,
  Calendar,
  Lock,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Sparkles,
} from 'lucide-react';

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

export default function StudentProfilePage() {
  const { user, isLoading: isAuthLoading, isLoggingOut, logoutAll, refetchUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmLogoutAllOpen, setIsConfirmLogoutAllOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Prepopulate form when authenticated user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: { name?: string; phone?: string } = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Name cannot exceed 100 characters.';
    }

    const trimmedPhone = formData.phone.trim();
    if (trimmedPhone && !INDIAN_PHONE_REGEX.test(trimmedPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: 'name' | 'phone', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !user) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const phoneChanged = (user.phone || '') !== trimmedPhone;

    try {
      const payload: { name: string; phone?: string } = {
        name: trimmedName,
      };
      if (trimmedPhone) {
        payload.phone = trimmedPhone;
      }

      await apiClient.patch(API_ENDPOINTS.auth.me, payload);

      // Invalidate auth query and refetch fresh user data
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await refetchUser();

      toast({
        type: 'success',
        title: 'Profile Updated',
        message: phoneChanged
          ? 'Profile updated successfully. Phone verification has been reset for security.'
          : 'Your personal information has been saved successfully.',
      });
    } catch (err) {
      const message = getErrorMessage(err);
      toast({
        type: 'error',
        title: 'Update Failed',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAllConfirm = async () => {
    try {
      await logoutAll();
    } catch (err) {
      const message = getErrorMessage(err);
      toast({
        type: 'error',
        title: 'Session Revocation Failed',
        message,
      });
      setIsConfirmLogoutAllOpen(false);
    }
  };

  // Compute initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const roleLabelMap: Record<string, string> = {
    user: 'Student',
    counsellor: 'Counsellor',
    admin: 'Administrator',
    super_admin: 'Super Admin',
  };

  if (isAuthLoading && !user) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-96 lg:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const roleName = user?.role ? roleLabelMap[user.role] || user.role : 'Student';
  const isAccountActive = user?.status === 'active';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Student Portal', href: '/student/dashboard' },
          { label: 'Profile & Settings' },
        ]}
        showHome
        homeHref="/"
      />

      {/* Page Heading */}
      <DashboardHeading
        eyebrow="Account Management"
        title="Profile & Settings"
        description="View your verified credentials, manage personal contact details, and control active sessions across all devices."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Summary & Account Overview */}
        <div className="space-y-6">
          <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800">
            {/* Decorative Top Accent Banner */}
            <div className="h-20 bg-gradient-to-r from-[#173D70] to-blue-600 dark:from-slate-800 dark:to-blue-950" />

            <CardContent className="relative pt-0 px-6 pb-6">
              {/* Profile Avatar with Fallback */}
              <div className="-mt-12 mb-4 flex justify-between items-end">
                <div className="relative">
                  {user?.avatar_url && !avatarError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={user.name || 'User Profile'}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-800"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#173D70] to-blue-600 text-white flex items-center justify-center text-2xl font-black border-4 border-white dark:border-slate-900 shadow-md">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 ${
                      isAccountActive ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    title={isAccountActive ? 'Active Account' : 'Inactive Account'}
                  />
                </div>

                <Badge variant={isAccountActive ? 'success' : 'destructive'} className="capitalize">
                  {user?.status || 'Active'}
                </Badge>
              </div>

              {/* User Identity Details */}
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Student'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{user?.email}</span>
                </p>
              </div>

              {/* Account Badges and Metadata */}
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Account Role
                  </span>
                  <Badge variant="primary">{roleName}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Email Status
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Google Verified
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    Phone Status
                  </span>
                  {user?.phone_verified ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member Since
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatDateKolkata(user?.created_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick SSO Information Notice */}
          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40">
            <CardContent className="p-4 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Single Sign-On Protected</p>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                  Your primary authentication is secured via Google OAuth 2.0. No password is stored on
                  Softmaxs servers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile Edit Form & Security Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>
                Update your display name and primary contact number. Changes to your phone number will
                reset your verification status.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                {/* Full Name Field */}
                <div>
                  <Input
                    id="profile-name"
                    label="Full Name"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    error={formErrors.name}
                    disabled={isSubmitting}
                    maxLength={100}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Between 2 and 100 characters. Visible on your certificates and course progress.
                  </p>
                </div>

                {/* Email Field (Strictly Read-Only) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="profile-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Email Address
                    </label>
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Read-only
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="profile-email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      readOnly
                      className="bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed pl-9 text-slate-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Your email address is managed directly by Google Single Sign-On and cannot be modified.
                  </p>
                </div>

                {/* Phone Number Field */}
                <div>
                  <Input
                    id="profile-phone"
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="10-digit Indian mobile number (e.g. 9876543210)"
                    error={formErrors.phone}
                    disabled={isSubmitting}
                    maxLength={10}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
                    Indian 10-digit format (starting with 6-9). Updating your phone resets verification.
                  </p>
                </div>

                {/* Account Role & Status (Strictly Read-Only System Values) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label
                      htmlFor="profile-role"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Assigned Role
                    </label>
                    <Input
                      id="profile-role"
                      value={roleName}
                      disabled
                      readOnly
                      className="bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed text-slate-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-status"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Account Status
                    </label>
                    <Input
                      id="profile-status"
                      value={isAccountActive ? 'Active' : 'Restricted'}
                      disabled
                      readOnly
                      className="bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed text-slate-500"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  All changes are saved directly to your profile.
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || isAuthLoading}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Session & Security Management Card */}
          <Card className="border-red-100 dark:border-red-950/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Session Security
                  </CardTitle>
                  <CardDescription>
                    Manage and revoke active sessions across all devices and browsers.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-red-950 dark:text-red-200 space-y-1">
                  <p className="font-bold">Log out from all active devices</p>
                  <p className="text-red-800 dark:text-red-300 leading-relaxed">
                    If you suspect unauthorized access or signed in from a shared computer, you can
                    immediately revoke all refresh tokens and sessions. You will be logged out everywhere
                    and required to authenticate again.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmLogoutAllOpen(true)}
                disabled={isLoggingOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900/60 font-semibold"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out From All Devices
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for Logout-All */}
      <ConfirmDialog
        isOpen={isConfirmLogoutAllOpen}
        onClose={() => setIsConfirmLogoutAllOpen(false)}
        onConfirm={handleLogoutAllConfirm}
        title="Log Out From All Devices?"
        description="This will immediately revoke all active refresh tokens and terminate sessions across every computer, phone, and browser. You will be redirected to the sign-in page."
        confirmLabel="Log Out Everywhere"
        cancelLabel="Keep Sessions"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </div>
  );
}
