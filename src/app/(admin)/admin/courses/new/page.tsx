'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DashboardHeading,
  DashboardSection,
} from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { adminCoursesApi } from '@/lib/api/admin-courses';
import { adminCategoriesApi } from '@/lib/api/admin-categories';
import { instructorApi } from '@/lib/api/instructor';
import { getErrorMessage, slugify } from '@/lib/utils';
import type { CourseLevel, CourseMode, CreateCoursePayload } from '@/types/admin-course';
import type { CategoryItem, SubcategoryItem } from '@/types/admin-category';
import type { Instructor } from '@/types/instructor';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);

  // Form state
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [isSlugManual, setIsSlugManual] = useState<boolean>(false);
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | ''>('');
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | ''>('');
  const [courseLevel, setCourseLevel] = useState<CourseLevel>('intermediate');
  const [language, setLanguage] = useState<string>('English');
  const [mode, setMode] = useState<CourseMode>('online');
  const [durationHours, setDurationHours] = useState<number>(40);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [price, setPrice] = useState<number>(4999);
  const [offerPrice, setOfferPrice] = useState<number>(2999);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Load classification metadata
  useEffect(() => {
    async function loadMetadata() {
      setIsLoadingMetadata(true);
      try {
        const [cats, subs, insts] = await Promise.all([
          adminCategoriesApi.getCategories(),
          adminCategoriesApi.getSubcategories(),
          instructorApi.getAdminInstructors({ page: 1, limit: 100 }),
        ]);
        setCategories(cats);
        setSubcategories(subs);
        setInstructors(insts.items || insts.instructors || []);
      } catch (err) {
        console.error('Failed to load course metadata', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    }
    loadMetadata();
  }, []);

  // Auto-generate slug unless manually edited
  const handleNameChange = (name: string) => {
    setCourseName(name);
    if (!isSlugManual) {
      setSlug(slugify(name));
    }
  };

  // Filter subcategories by selected category
  const filteredSubcategories = selectedCategoryId
    ? subcategories.filter((s) => s.category_id === Number(selectedCategoryId))
    : subcategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!courseCode.trim()) {
      setFormError('Course code is required (e.g. FSWD-101).');
      return;
    }
    if (!courseName.trim()) {
      setFormError('Course title is required.');
      return;
    }
    if (!shortDescription.trim()) {
      setFormError('Short description is required.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setFormError('Full description must be at least 10 characters.');
      return;
    }
    if (!selectedSubcategoryId) {
      setFormError('Please select a valid subcategory.');
      return;
    }
    if (offerPrice && offerPrice > price) {
      setFormError('Offer price cannot exceed the regular price.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateCoursePayload = {
        course_code: courseCode.trim().toUpperCase(),
        course_name: courseName.trim(),
        slug: slug.trim() || slugify(courseName),
        short_description: shortDescription.trim(),
        description: description.trim(),
        subcategory_id: Number(selectedSubcategoryId),
        instructor_id: selectedInstructorId ? Number(selectedInstructorId) : null,
        course_level: courseLevel,
        language: language.trim() || 'English',
        mode,
        duration_hours: Number(durationHours),
        duration_days: durationDays ? Number(durationDays) : null,
        price: Number(price),
        offer_price: offerPrice ? Number(offerPrice) : null,
        thumbnail_url: thumbnailUrl.trim() || null,
      };

      const created = await adminCoursesApi.createCourse(payload);
      // Smoothly navigate to multi-step editor Step 2
      router.push(`/admin/courses/${created.id}/edit?step=2&created=1`);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to create course'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      <Breadcrumbs
        items={[
          { label: 'Admin Center', href: '/admin/dashboard' },
          { label: 'Courses Management', href: '/admin/courses' },
          { label: 'Create Course' },
        ]}
      />

      <div className="flex items-center justify-between">
        <DashboardHeading
          title="Create New Course"
          subtitle="Set up initial course identity, classification, and pricing to initialize the curriculum builder."
        />
        <Link href="/admin/courses">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalog
          </Button>
        </Link>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identity */}
        <DashboardSection
          title="1. Course Identity"
          subtitle="Define unique identifiers and public course name."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. FSWD-2026"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                required
              />
              <span className="text-[11px] text-slate-500">Unique internal course reference code</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Full Stack Web Development with Next.js & Node.js"
                value={courseName}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">/courses/</span>
              <Input
                placeholder="full-stack-web-development"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManual(true);
                }}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Crisp 1-2 sentence overview of the course for catalog cards..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={500}
              required
              className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Course Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Comprehensive course syllabus description, prerequisites, and learning outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </DashboardSection>

        {/* Section 2: Classification */}
        <DashboardSection
          title="2. Classification & Instructor Assignment"
          subtitle="Attach this program to category tracks and certified instructors."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value ? Number(e.target.value) : '');
                  setSelectedSubcategoryId('');
                }}
                className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- All Categories --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subcategory <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Select Subcategory --</option>
                {filteredSubcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Instructor
              </label>
              <select
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Unassigned --</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Level
              </label>
              <select
                value={courseLevel}
                onChange={(e) => setCourseLevel(e.target.value as CourseLevel)}
                className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instruction Language
              </label>
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English / Hindi"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Delivery Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as CourseMode)}
                className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
              >
                <option value="online">Online Live</option>
                <option value="offline">Classroom / Offline</option>
                <option value="hybrid">Hybrid</option>
                <option value="self_paced">Self Paced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration (Hours)
              </label>
              <Input
                type="number"
                min={1}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                required
              />
            </div>
          </div>
        </DashboardSection>

        {/* Section 3: Pricing & Media */}
        <DashboardSection
          title="3. Pricing & Thumbnail"
          subtitle="Configure pricing points and visual presentation."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Regular Price (INR) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Offer / Discounted Price (INR)
              </label>
              <Input
                type="number"
                min={0}
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
              />
              <span className="text-[11px] text-slate-500">Optional. Must be less than or equal to regular price.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration Days (Optional)
              </label>
              <Input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thumbnail Image URL
            </label>
            <Input
              type="url"
              placeholder="https://example.com/images/course-banner.jpg"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
          </div>
        </DashboardSection>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link href="/admin/courses">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || isLoadingMetadata}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
          >
            {isSubmitting ? (
              'Creating Course...'
            ) : (
              <>
                <span>Save & Continue to Curriculum</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
