'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  DashboardSection,
} from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { adminCoursesApi } from '@/lib/api/admin-courses';
import { adminCategoriesApi } from '@/lib/api/admin-categories';
import { instructorApi } from '@/lib/api/instructor';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { getErrorMessage, slugify } from '@/lib/utils';
import type {
  AdminCourseItem,
  CourseLevel,
  CourseMode,
  CourseStatus,
  ModuleItem,
  LessonType,
  ReorderCurriculumPayload,
  BatchItem,
  BatchStatus,
  CourseFaqItem,
  CourseBenefitsData,
  CourseTestimonialItem,
  CoursePointType,
  CoursePointItem,
  MaterialType,
  CourseMaterialItem,
  InstallmentPlanItem,
  CourseOfferItem,
} from '@/types/admin-course';
import type { CategoryItem, SubcategoryItem } from '@/types/admin-category';
import type { Instructor } from '@/types/instructor';
import {
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Save,
  ArrowUp,
  ArrowDown,
  X,
  Package,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: '1. Basic Info' },
  { id: 2, label: '2. Classification' },
  { id: 3, label: '3. Pricing & Content' },
  { id: 4, label: '4. Curriculum' },
  { id: 5, label: '5. Batches' },
  { id: 6, label: '6. SEO & Publish' },
];

const STEP_3_TABS = [
  { id: 'pricing', label: 'Commercials' },
  { id: 'points', label: 'Key Highlights' },
  { id: 'benefits', label: 'Career Benefits' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'materials', label: 'Materials' },
  { id: 'installments', label: 'Installments & Offers' },
] as const;

type Step3Tab = (typeof STEP_3_TABS)[number]['id'];

export default function CourseEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = Number(params.id);

  const initialStep = Number(searchParams.get('step') || 1);
  const [activeStep, setActiveStep] = useState<number>(initialStep);
  const [activeStep3Tab, setActiveStep3Tab] = useState<Step3Tab>('pricing');

  const [course, setCourse] = useState<AdminCourseItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Classification metadata
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Step 1: Basic form
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [courseLevel, setCourseLevel] = useState<CourseLevel>('intermediate');
  const [language, setLanguage] = useState<string>('English');
  const [mode, setMode] = useState<CourseMode>('online');
  const [durationHours, setDurationHours] = useState<number>(40);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  // Step 2: Classification form
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | ''>('');
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | ''>('');

  // Step 3A: Commercial Pricing & Policies
  const [price, setPrice] = useState<number>(4999);
  const [offerPrice, setOfferPrice] = useState<number>(2999);
  const [currency, setCurrency] = useState<string>('INR');
  const [taxInclusive, setTaxInclusive] = useState<boolean>(false);
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [isFree, setIsFree] = useState<boolean>(false);
  const [refundPolicy, setRefundPolicy] = useState<string>('');
  const [refundDays, setRefundDays] = useState<number>(7);

  // Step 3B: Course Points
  const [points, setPoints] = useState<CoursePointItem[]>([]);
  const [pointTypeFilter, setPointTypeFilter] = useState<string>('all');
  const [newPointType, setNewPointType] = useState<CoursePointType>('learn');
  const [newPointText, setNewPointText] = useState<string>('');
  const [editingPointId, setEditingPointId] = useState<number | null>(null);
  const [editingPointText, setEditingPointText] = useState<string>('');

  // Step 3C: Benefits
  const [benefitsData, setBenefitsData] = useState<CourseBenefitsData>({
    certificate_enabled: false,
    certificate_type: 'Certificate of Professional Completion',
    career_support_enabled: false,
    mock_interviews: false,
    resume_support: false,
    placement_assistance: false,
    internship_support: false,
    project_count: 3,
    lifetime_access: true,
    access_duration_days: 0,
  });

  // Step 3D: FAQs
  const [faqsList, setFaqsList] = useState<CourseFaqItem[]>([]);
  const [faqModalOpen, setFaqModalOpen] = useState<boolean>(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [faqQuestion, setFaqQuestion] = useState<string>('');
  const [faqAnswer, setFaqAnswer] = useState<string>('');

  // Step 3E: Testimonials
  const [testimonialsList, setTestimonialsList] = useState<CourseTestimonialItem[]>([]);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState<boolean>(false);
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState<number | null>(null);
  const [testimonialName, setTestimonialName] = useState<string>('');
  const [testimonialText, setTestimonialText] = useState<string>('');
  const [testimonialPhotoUrl, setTestimonialPhotoUrl] = useState<string>('');
  const [testimonialVideoUrl, setTestimonialVideoUrl] = useState<string>('');
  const [testimonialIsActive, setTestimonialIsActive] = useState<boolean>(true);

  // Step 3F: Materials
  const [materialsList, setMaterialsList] = useState<CourseMaterialItem[]>([]);
  const [materialModalOpen, setMaterialModalOpen] = useState<boolean>(false);
  const [materialTitle, setMaterialTitle] = useState<string>('');
  const [materialType, setMaterialType] = useState<MaterialType>('notes');
  const [materialFilePath, setMaterialFilePath] = useState<string>('');
  const [materialIsPreview, setMaterialIsPreview] = useState<boolean>(false);
  const [materialRequiresEnrollment, setMaterialRequiresEnrollment] = useState<boolean>(true);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState<boolean>(false);

  // Step 3G: Installments & Offers
  const [installmentsList, setInstallmentsList] = useState<InstallmentPlanItem[]>([]);
  const [installmentModalOpen, setInstallmentModalOpen] = useState<boolean>(false);
  const [editingInstallmentId, setEditingInstallmentId] = useState<number | null>(null);
  const [installmentPlanName, setInstallmentPlanName] = useState<string>('');
  const [installmentCount, setInstallmentCount] = useState<number>(3);
  const [installmentAmount, setInstallmentAmount] = useState<number>(1000);
  const [installmentIntervalDays, setInstallmentIntervalDays] = useState<number>(30);
  const [installmentIsActive, setInstallmentIsActive] = useState<boolean>(true);

  const [offersList, setOffersList] = useState<CourseOfferItem[]>([]);
  const [offerModalOpen, setOfferModalOpen] = useState<boolean>(false);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [offerName, setOfferName] = useState<string>('');
  const [offerDiscountType, setOfferDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [offerDiscountValue, setOfferDiscountValue] = useState<number>(20);
  const [offerCouponCode, setOfferCouponCode] = useState<string>('');
  const [offerStartsAt, setOfferStartsAt] = useState<string>('');
  const [offerEndsAt, setOfferEndsAt] = useState<string>('');
  const [offerUsageLimit, setOfferUsageLimit] = useState<number | ''>('');
  const [offerPerUserLimit, setOfferPerUserLimit] = useState<number>(1);
  const [offerIsActive, setOfferIsActive] = useState<boolean>(true);

  // Step 4: Curriculum
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isCurriculumLoading, setIsCurriculumLoading] = useState<boolean>(false);
  const [newModuleTitle, setNewModuleTitle] = useState<string>('');
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState<string>('');
  const [newLessonType, setNewLessonType] = useState<LessonType>('video');
  const [newLessonDuration, setNewLessonDuration] = useState<number>(600);
  const [newLessonUrl, setNewLessonUrl] = useState<string>('');
  const [newLessonPreview, setNewLessonPreview] = useState<boolean>(false);

  // Step 5: Batches
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isBatchesLoading, setIsBatchesLoading] = useState<boolean>(false);
  const [batchName, setBatchName] = useState<string>('');
  const [batchStartDate, setBatchStartDate] = useState<string>('');
  const [batchEndDate, setBatchEndDate] = useState<string>('');
  const [batchClassTiming, setBatchClassTiming] = useState<string>('7:00 PM - 9:00 PM IST');
  const [batchSeats, setBatchSeats] = useState<number>(30);
  const [batchStatus, setBatchStatus] = useState<BatchStatus>('open');

  // Step 5: Batch Editing
  const [editBatchModalOpen, setEditBatchModalOpen] = useState<boolean>(false);
  const [editingBatchId, setEditingBatchId] = useState<number | null>(null);
  const [editBatchName, setEditBatchName] = useState<string>('');
  const [editBatchStartDate, setEditBatchStartDate] = useState<string>('');
  const [editBatchEndDate, setEditBatchEndDate] = useState<string>('');
  const [editBatchClassDays, setEditBatchClassDays] = useState<string>('');
  const [editBatchClassTiming, setEditBatchClassTiming] = useState<string>('');
  const [editBatchSeats, setEditBatchSeats] = useState<number>(30);
  const [editBatchDeadline, setEditBatchDeadline] = useState<string>('');
  const [editBatchLocation, setEditBatchLocation] = useState<string>('');
  const [editBatchStatus, setEditBatchStatus] = useState<BatchStatus>('open');

  // Step 6: SEO & Status
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [seoDescription, setSeoDescription] = useState<string>('');
  const [status, setStatus] = useState<CourseStatus>('draft');

  // Load Course and Metadata
  const loadCourseData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [c, cats, subs, insts] = await Promise.all([
        adminCoursesApi.getCourseById(courseId),
        adminCategoriesApi.getCategories(),
        adminCategoriesApi.getSubcategories(),
        instructorApi.getAdminInstructors({ page: 1, limit: 100 }),
      ]);

      setCourse(c);
      setCategories(cats);
      setSubcategories(subs);
      setInstructors(insts.items || insts.instructors || []);

      // Populate basic info
      setCourseCode(c.course_code || '');
      setCourseName(c.course_name || '');
      setSlug(c.slug || '');
      setShortDescription(c.short_description || '');
      setDescription(c.description || '');
      setCourseLevel(c.course_level || 'intermediate');
      setLanguage(c.language || 'English');
      setMode(c.mode || 'online');
      setDurationHours(c.duration_hours || 0);
      setDurationDays(c.duration_days || 0);
      setThumbnailUrl(c.thumbnail_url || '');
      setSelectedCategoryId(c.category_id || '');
      setSelectedSubcategoryId(c.subcategory_id || '');
      setSelectedInstructorId(c.instructor_id || '');
      setPrice(c.price || 0);
      setOfferPrice(c.offer_price || 0);
      setStatus(c.status || 'draft');
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Failed to load course details'));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId, loadCourseData]);

  // Load Step 3 Enhancements
  const loadEnhancements = useCallback(async () => {
    try {
      const [pData, pts, bData, faqs, tData, mats, insts, offs] = await Promise.allSettled([
        adminCoursesApi.getPricing(courseId),
        adminCoursesApi.getPoints(courseId),
        adminCoursesApi.getBenefits(courseId),
        adminCoursesApi.getFaqs(courseId),
        adminCoursesApi.getTestimonials(courseId),
        adminCoursesApi.getMaterials(courseId),
        adminCoursesApi.getInstallments(courseId),
        adminCoursesApi.getOffers(courseId),
      ]);

      if (pData.status === 'fulfilled' && pData.value) {
        setPrice(pData.value.price || 0);
        setOfferPrice(pData.value.offer_price || 0);
        setCurrency(pData.value.currency || 'INR');
        setTaxInclusive(Boolean(pData.value.tax_inclusive));
        setGstPercentage(pData.value.gst_percentage ?? 18);
        setIsFree(Boolean(pData.value.is_free));
        setRefundPolicy(pData.value.refund_policy || '');
        setRefundDays(pData.value.refund_days ?? 7);
      }

      if (pts.status === 'fulfilled' && Array.isArray(pts.value)) {
        setPoints(pts.value);
      }

      if (bData.status === 'fulfilled' && bData.value) {
        setBenefitsData({
          certificate_enabled: Boolean(bData.value.certificate_enabled),
          certificate_type: bData.value.certificate_type || 'Certificate of Professional Completion',
          career_support_enabled: Boolean(bData.value.career_support_enabled),
          mock_interviews: Boolean(bData.value.mock_interviews),
          resume_support: Boolean(bData.value.resume_support),
          placement_assistance: Boolean(bData.value.placement_assistance),
          internship_support: Boolean(bData.value.internship_support),
          project_count: Number(bData.value.project_count || 0),
          lifetime_access: Boolean(bData.value.lifetime_access),
          access_duration_days: Number(bData.value.access_duration_days || 0),
        });
      }

      if (faqs.status === 'fulfilled' && Array.isArray(faqs.value)) {
        setFaqsList(faqs.value);
      }

      if (tData.status === 'fulfilled' && Array.isArray(tData.value)) {
        setTestimonialsList(tData.value);
      }

      if (mats.status === 'fulfilled' && Array.isArray(mats.value)) {
        setMaterialsList(mats.value);
      }

      if (insts.status === 'fulfilled' && Array.isArray(insts.value)) {
        setInstallmentsList(insts.value);
      }

      if (offs.status === 'fulfilled' && Array.isArray(offs.value)) {
        setOffersList(offs.value);
      }
    } catch (err) {
      console.error('Failed to load course enhancements', err);
    }
  }, [courseId]);

  // Load Curriculum on Step 4
  const loadCurriculum = useCallback(async () => {
    setIsCurriculumLoading(true);
    try {
      const data = await adminCoursesApi.getCurriculum(courseId);
      setModules(data);
    } catch (err) {
      console.error('Failed to load curriculum', err);
    } finally {
      setIsCurriculumLoading(false);
    }
  }, [courseId]);

  // Load Batches on Step 5
  const loadBatches = useCallback(async () => {
    setIsBatchesLoading(true);
    try {
      const data = await adminCoursesApi.getBatches(courseId);
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches', err);
    } finally {
      setIsBatchesLoading(false);
    }
  }, [courseId]);

  // Load SEO on Step 6
  const loadSeo = useCallback(async () => {
    try {
      const data = await adminCoursesApi.getSeo(courseId);
      setSeoTitle(data.seo_title || '');
      setSeoDescription(data.seo_description || '');
    } catch (err) {
      console.error('Failed to load SEO', err);
    }
  }, [courseId]);

  // Trigger lazy tab loads
  useEffect(() => {
    if (activeStep === 3) loadEnhancements();
    if (activeStep === 4) loadCurriculum();
    if (activeStep === 5) loadBatches();
    if (activeStep === 6) loadSeo();
  }, [activeStep, loadEnhancements, loadCurriculum, loadBatches, loadSeo]);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    setSuccessMessage('');
    setErrorMessage('');
    window.history.replaceState(null, '', `?step=${step}`);
  };

  // Step 1 & 2: Save Course Metadata
  const handleSaveBasicInfo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!courseName.trim() || !courseCode.trim() || !shortDescription.trim()) {
      setErrorMessage('Course name, course code, and short description are required.');
      setIsSaving(false);
      return;
    }

    if (!selectedSubcategoryId) {
      setErrorMessage('Subcategory is required.');
      setIsSaving(false);
      return;
    }

    try {
      await adminCoursesApi.updateCourse(courseId, {
        course_name: courseName.trim(),
        course_code: courseCode.trim().toUpperCase(),
        slug: slug.trim() ? slugify(slug) : undefined,
        short_description: shortDescription.trim(),
        description: description.trim(),
        subcategory_id: Number(selectedSubcategoryId),
        instructor_id: selectedInstructorId ? Number(selectedInstructorId) : null,
        course_level: courseLevel,
        language: language.trim(),
        mode,
        duration_hours: Number(durationHours),
        duration_days: Number(durationDays),
        thumbnail_url: thumbnailUrl.trim() || null,
        price: Number(price),
        offer_price: offerPrice ? Number(offerPrice) : null,
      });

      setSuccessMessage('Course updated successfully!');
      loadCourseData();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Failed to update course'));
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // Step 3 Enhancement Handlers
  // ==========================================

  // 3A: Save Pricing & Policies
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!isFree && offerPrice && Number(offerPrice) > Number(price)) {
      setErrorMessage('Offer price cannot be greater than regular price.');
      setIsSaving(false);
      return;
    }

    try {
      await adminCoursesApi.updatePricing(courseId, {
        price: isFree ? 0 : Number(price),
        offer_price: isFree ? null : offerPrice ? Number(offerPrice) : null,
        currency: currency.trim() || 'INR',
        tax_inclusive: taxInclusive,
        gst_percentage: Number(gstPercentage),
        is_free: isFree,
        refund_policy: refundPolicy.trim() || null,
        refund_days: Number(refundDays),
      });
      setSuccessMessage('Pricing & commercial settings saved successfully!');
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Failed to update pricing settings'));
    } finally {
      setIsSaving(false);
    }
  };

  // 3B: Course Points Handlers
  const handleAddPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointText.trim()) return;

    const newPoint: CoursePointItem = {
      point_type: newPointType,
      text: newPointText.trim(),
      display_order: points.length + 1,
    };

    const updated = [...points, newPoint];
    try {
      const res = await adminCoursesApi.updatePoints(courseId, updated);
      setPoints(res);
      setNewPointText('');
      setSuccessMessage('Course point added successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save course point'));
    }
  };

  const handleSaveEditedPoint = async (pointId?: number) => {
    if (!editingPointText.trim()) return;
    const updated = points.map((p) =>
      p.id === pointId ? { ...p, text: editingPointText.trim() } : p
    );
    try {
      const res = await adminCoursesApi.updatePoints(courseId, updated);
      setPoints(res);
      setEditingPointId(null);
      setEditingPointText('');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update point'));
    }
  };

  const handleDeletePoint = async (index: number) => {
    if (!confirm('Are you sure you want to delete this highlight?')) return;
    const updated = points.filter((_, idx) => idx !== index);
    try {
      const res = await adminCoursesApi.updatePoints(courseId, updated);
      setPoints(res);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete point'));
    }
  };

  const handleMovePoint = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= points.length) return;

    const updated = [...points];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((p, idx) => ({ ...p, display_order: idx + 1 }));
    try {
      const res = await adminCoursesApi.updatePoints(courseId, reordered);
      setPoints(res);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to reorder points'));
    }
  };

  // 3C: Save Career Benefits
  const handleSaveBenefits = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await adminCoursesApi.updateBenefits(courseId, benefitsData);
      setBenefitsData(res);
      setSuccessMessage('Career benefits & course perks updated successfully!');
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Failed to update course benefits'));
    } finally {
      setIsSaving(false);
    }
  };

  // 3D: FAQs Handlers
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      alert('Question and answer are required.');
      return;
    }

    let updatedFaqs: CourseFaqItem[];
    if (editingFaqIndex !== null) {
      updatedFaqs = faqsList.map((f, idx) =>
        idx === editingFaqIndex
          ? { ...f, question: faqQuestion.trim(), answer: faqAnswer.trim() }
          : f
      );
    } else {
      updatedFaqs = [
        ...faqsList,
        {
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          display_order: faqsList.length + 1,
        },
      ];
    }

    try {
      const res = await adminCoursesApi.updateFaqs(courseId, updatedFaqs);
      setFaqsList(res);
      setFaqModalOpen(false);
      setEditingFaqIndex(null);
      setFaqQuestion('');
      setFaqAnswer('');
      setSuccessMessage('Course FAQs updated successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save FAQs'));
    }
  };

  const handleDeleteFaq = async (index: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    const updated = faqsList.filter((_, idx) => idx !== index);
    try {
      const res = await adminCoursesApi.updateFaqs(courseId, updated);
      setFaqsList(res);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete FAQ'));
    }
  };

  const handleMoveFaq = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqsList.length) return;

    const updated = [...faqsList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((f, idx) => ({ ...f, display_order: idx + 1 }));
    try {
      const res = await adminCoursesApi.updateFaqs(courseId, reordered);
      setFaqsList(res);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to reorder FAQs'));
    }
  };

  // 3E: Testimonials Handlers
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialName.trim() || !testimonialText.trim()) {
      alert('Student name and testimonial text are required.');
      return;
    }

    let updatedTestimonials: CourseTestimonialItem[];
    if (editingTestimonialIndex !== null) {
      updatedTestimonials = testimonialsList.map((t, idx) =>
        idx === editingTestimonialIndex
          ? {
              ...t,
              name: testimonialName.trim(),
              text: testimonialText.trim(),
              photo_url: testimonialPhotoUrl.trim() || null,
              video_url: testimonialVideoUrl.trim() || null,
              is_active: testimonialIsActive,
            }
          : t
      );
    } else {
      updatedTestimonials = [
        ...testimonialsList,
        {
          name: testimonialName.trim(),
          text: testimonialText.trim(),
          photo_url: testimonialPhotoUrl.trim() || null,
          video_url: testimonialVideoUrl.trim() || null,
          is_active: testimonialIsActive,
        },
      ];
    }

    try {
      const res = await adminCoursesApi.updateTestimonials(courseId, updatedTestimonials);
      setTestimonialsList(res);
      setTestimonialModalOpen(false);
      setEditingTestimonialIndex(null);
      setTestimonialName('');
      setTestimonialText('');
      setTestimonialPhotoUrl('');
      setTestimonialVideoUrl('');
      setTestimonialIsActive(true);
      setSuccessMessage('Testimonials updated successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save testimonial'));
    }
  };

  const handleDeleteTestimonial = async (index: number) => {
    if (!confirm('Are you sure you want to remove this testimonial?')) return;
    const updated = testimonialsList.filter((_, idx) => idx !== index);
    try {
      const res = await adminCoursesApi.updateTestimonials(courseId, updated);
      setTestimonialsList(res);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete testimonial'));
    }
  };

  // 3F: Materials Handlers
  const handleMaterialFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploadingMaterial(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'material');

      const res = await apiClient.post(API_ENDPOINTS.uploads.adminUpload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.data) {
        setMaterialFilePath(res.data.data.path || '');
        if (!materialTitle.trim()) {
          setMaterialTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        throw new Error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to upload material attachment'));
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim() || !materialFilePath.trim()) {
      alert('Material title and file path are required.');
      return;
    }

    try {
      await adminCoursesApi.addMaterial(courseId, {
        title: materialTitle.trim(),
        material_type: materialType,
        file_path: materialFilePath.trim(),
        is_preview: materialIsPreview,
        requires_enrollment: materialRequiresEnrollment,
        display_order: materialsList.length + 1,
      });

      const updated = await adminCoursesApi.getMaterials(courseId);
      setMaterialsList(updated);
      setMaterialModalOpen(false);
      setMaterialTitle('');
      setMaterialFilePath('');
      setMaterialIsPreview(false);
      setMaterialRequiresEnrollment(true);
      setSuccessMessage('Course material created successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save material'));
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm('Are you sure you want to remove this material item?')) return;
    try {
      await adminCoursesApi.deleteMaterial(materialId);
      setMaterialsList((prev) => prev.filter((m) => m.id !== materialId));
      setSuccessMessage('Material removed.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete material'));
    }
  };

  // 3G: Installments Handlers
  const handleSaveInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!installmentPlanName.trim() || Number(installmentCount) < 2 || Number(installmentAmount) <= 0) {
      alert('Valid plan name, installment count (>=2), and amount (>0) are required.');
      return;
    }

    try {
      if (editingInstallmentId) {
        await adminCoursesApi.updateInstallment(courseId, editingInstallmentId, {
          plan_name: installmentPlanName.trim(),
          installment_count: Number(installmentCount),
          installment_amount: Number(installmentAmount),
          interval_days: Number(installmentIntervalDays),
          is_active: installmentIsActive,
        });
      } else {
        await adminCoursesApi.createInstallment(courseId, {
          plan_name: installmentPlanName.trim(),
          installment_count: Number(installmentCount),
          installment_amount: Number(installmentAmount),
          interval_days: Number(installmentIntervalDays),
          is_active: installmentIsActive,
        });
      }

      const updated = await adminCoursesApi.getInstallments(courseId);
      setInstallmentsList(updated);
      setInstallmentModalOpen(false);
      setEditingInstallmentId(null);
      setInstallmentPlanName('');
      setSuccessMessage('Installment plan saved successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save installment plan'));
    }
  };

  const handleDeleteInstallment = async (planId: number) => {
    if (!confirm('Are you sure you want to remove this installment option?')) return;
    try {
      await adminCoursesApi.deleteInstallment(courseId, planId);
      setInstallmentsList((prev) => prev.filter((p) => p.id !== planId));
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete installment plan'));
    }
  };

  // 3G: Offers Handlers
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerName.trim() || Number(offerDiscountValue) <= 0 || !offerStartsAt || !offerEndsAt) {
      alert('Offer name, discount value, starts at, and ends at dates are required.');
      return;
    }

    if (new Date(offerEndsAt) <= new Date(offerStartsAt)) {
      alert('Offer ends at date must be strictly after starts at date.');
      return;
    }

    try {
      const payload = {
        offer_name: offerName.trim(),
        discount_type: offerDiscountType,
        discount_value: Number(offerDiscountValue),
        coupon_code: offerCouponCode.trim() ? offerCouponCode.trim().toUpperCase() : null,
        starts_at: new Date(offerStartsAt).toISOString(),
        ends_at: new Date(offerEndsAt).toISOString(),
        usage_limit: offerUsageLimit ? Number(offerUsageLimit) : null,
        per_user_limit: Number(offerPerUserLimit) || 1,
        is_active: offerIsActive,
      };

      if (editingOfferId) {
        await adminCoursesApi.updateOffer(courseId, editingOfferId, payload);
      } else {
        await adminCoursesApi.createOffer(courseId, payload);
      }

      const updated = await adminCoursesApi.getOffers(courseId);
      setOffersList(updated);
      setOfferModalOpen(false);
      setEditingOfferId(null);
      setOfferName('');
      setOfferCouponCode('');
      setSuccessMessage('Promotional offer saved successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save promotional offer'));
    }
  };

  const handleDeleteOffer = async (offerId: number) => {
    if (!confirm('Are you sure you want to delete this promotional offer?')) return;
    try {
      await adminCoursesApi.deleteOffer(courseId, offerId);
      setOffersList((prev) => prev.filter((o) => o.id !== offerId));
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete offer'));
    }
  };

  // ==========================================
  // Step 4: Curriculum Operations & Reordering
  // ==========================================

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      await adminCoursesApi.createModule(courseId, {
        title: newModuleTitle.trim(),
        display_order: modules.length + 1,
        is_published: true,
      });
      setNewModuleTitle('');
      loadCurriculum();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to create module'));
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      await adminCoursesApi.deleteModule(moduleId);
      loadCurriculum();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete module'));
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleForLesson || !newLessonTitle.trim()) return;

    try {
      await adminCoursesApi.createLesson(activeModuleForLesson, {
        title: newLessonTitle.trim(),
        lesson_type: newLessonType,
        duration_seconds: Number(newLessonDuration),
        content_url: newLessonUrl.trim() || null,
        is_preview: newLessonPreview,
        is_published: true,
      });
      setNewLessonTitle('');
      setNewLessonUrl('');
      setActiveModuleForLesson(null);
      loadCurriculum();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to create lesson'));
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await adminCoursesApi.deleteLesson(lessonId);
      loadCurriculum();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete lesson'));
    }
  };

  // Curriculum Reordering
  const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const previousModules = [...modules];
    const updatedModules = [...modules];
    const [moved] = updatedModules.splice(index, 1);
    updatedModules.splice(targetIndex, 0, moved);

    setModules(updatedModules);

    const payload: ReorderCurriculumPayload = {
      modules: updatedModules.map((m, mIdx) => ({
        id: m.id,
        display_order: mIdx + 1,
        lessons: (m.lessons || []).map((l, lIdx) => ({
          id: l.id,
          display_order: lIdx + 1,
        })),
      })),
    };

    try {
      await adminCoursesApi.reorderCurriculum(courseId, payload);
      setSuccessMessage('Curriculum modules reordered.');
    } catch (err) {
      setModules(previousModules);
      alert(getErrorMessage(err, 'Failed to reorder modules'));
    }
  };

  const handleMoveLesson = async (
    moduleIndex: number,
    lessonIndex: number,
    direction: 'up' | 'down'
  ) => {
    const mod = modules[moduleIndex];
    if (!mod || !mod.lessons) return;

    const targetLessonIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetLessonIndex < 0 || targetLessonIndex >= mod.lessons.length) return;

    const previousModules = [...modules];
    const updatedLessons = [...mod.lessons];
    const [moved] = updatedLessons.splice(lessonIndex, 1);
    updatedLessons.splice(targetLessonIndex, 0, moved);

    const updatedModules = modules.map((m, idx) =>
      idx === moduleIndex ? { ...m, lessons: updatedLessons } : m
    );

    setModules(updatedModules);

    const payload: ReorderCurriculumPayload = {
      modules: updatedModules.map((m, mIdx) => ({
        id: m.id,
        display_order: mIdx + 1,
        lessons: (m.lessons || []).map((l, lIdx) => ({
          id: l.id,
          display_order: lIdx + 1,
        })),
      })),
    };

    try {
      await adminCoursesApi.reorderCurriculum(courseId, payload);
      setSuccessMessage('Lessons reordered.');
    } catch (err) {
      setModules(previousModules);
      alert(getErrorMessage(err, 'Failed to reorder lessons'));
    }
  };

  // ==========================================
  // Step 5: Batch Operations & Editing
  // ==========================================

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim() || !batchStartDate) return;

    if (batchEndDate && new Date(batchEndDate) < new Date(batchStartDate)) {
      alert('End date cannot be earlier than start date.');
      return;
    }

    try {
      await adminCoursesApi.createBatch(courseId, {
        batch_name: batchName.trim(),
        start_date: batchStartDate,
        end_date: batchEndDate || null,
        class_timing: batchClassTiming.trim() || null,
        total_seats: Number(batchSeats),
        status: batchStatus,
      });
      setBatchName('');
      setBatchStartDate('');
      setBatchEndDate('');
      loadBatches();
      setSuccessMessage('Batch scheduled successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to create batch'));
    }
  };

  const handleOpenEditBatch = (b: BatchItem) => {
    setEditingBatchId(b.id);
    setEditBatchName(b.batch_name);
    setEditBatchStatus(b.status);
    setEditBatchStartDate(b.start_date);
    setEditBatchEndDate(b.end_date || '');
    setEditBatchClassDays(b.class_days || '');
    setEditBatchClassTiming(b.class_timing || '');
    setEditBatchSeats(b.total_seats);
    setEditBatchDeadline(b.enrollment_deadline || '');
    setEditBatchLocation(b.location || '');
    setEditBatchModalOpen(true);
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatchId || !editBatchName.trim() || !editBatchStartDate) return;

    if (editBatchEndDate && new Date(editBatchEndDate) < new Date(editBatchStartDate)) {
      alert('End date cannot be earlier than start date.');
      return;
    }

    try {
      await adminCoursesApi.updateBatch(editingBatchId, {
        batch_name: editBatchName.trim(),
        start_date: editBatchStartDate,
        end_date: editBatchEndDate || null,
        class_days: editBatchClassDays.trim() || null,
        class_timing: editBatchClassTiming.trim() || null,
        total_seats: Number(editBatchSeats),
        enrollment_deadline: editBatchDeadline || null,
        location: editBatchLocation.trim() || null,
        status: editBatchStatus,
      });

      setEditBatchModalOpen(false);
      setEditingBatchId(null);
      loadBatches();
      setSuccessMessage('Batch updated successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update batch'));
    }
  };

  const handleDeleteBatch = async (batchId: number) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      await adminCoursesApi.deleteBatch(batchId);
      loadBatches();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete batch'));
    }
  };

  // Step 6: Save SEO & Status
  const handleSaveSeoAndStatus = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await Promise.all([
        adminCoursesApi.updateSeo(courseId, {
          seo_title: seoTitle.trim() || null,
          seo_description: seoDescription.trim() || null,
        }),
        adminCoursesApi.updateStatus(courseId, status),
      ]);
      setSuccessMessage('SEO settings and publication status updated successfully!');
      loadCourseData();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Failed to update publication settings'));
    } finally {
      setIsSaving(false);
    }
  };

  // Filter subcategories by selected category
  const filteredSubcategories = selectedCategoryId
    ? subcategories.filter((s) => s.category_id === Number(selectedCategoryId))
    : subcategories;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading course workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Admin Center', href: '/admin/dashboard' },
          { label: 'Courses Management', href: '/admin/courses' },
          { label: course?.course_name || 'Course Editor' },
        ]}
      />

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {course?.course_name}
            </h1>
            <Badge
              variant={
                course?.status === 'published'
                  ? 'success'
                  : course?.status === 'draft'
                  ? 'warning'
                  : 'default'
              }
            >
              {course?.status?.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Code: {course?.course_code} • Slug: /courses/{course?.slug}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {course?.slug && (
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview Public Page
            </Link>
          )}
          <Link href="/admin/courses">
            <Button variant="outline" size="sm" className="text-xs">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Six Step Progression Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {STEPS.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              type="button"
              key={step.id}
              onClick={() => handleStepChange(step.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span className="text-xs">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: Basic Information */}
      {activeStep === 1 && (
        <form onSubmit={handleSaveBasicInfo} className="space-y-6">
          <DashboardSection
            title="General Identity"
            subtitle="Core naming and taxonomy attributes representing this curriculum."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. FSD-REACT-01"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Display Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={courseName}
                  onChange={(e) => {
                    setCourseName(e.target.value);
                    if (!slug) setSlug(slugify(e.target.value));
                  }}
                  required
                  placeholder="e.g. Master Full Stack Web Development"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Public URL Slug
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="master-full-stack-web-development"
              />
              <span className="text-[11px] text-slate-500">
                Will be accessible at: https://softmaxs.com/courses/{slug || '[slug]'}
              </span>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Description (Catalog Summary) <span className="text-rose-500">*</span>
              </label>
              <Input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                required
                placeholder="Brief summary displayed on cards..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Description (HTML or Markdown) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Level
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
                  Language
                </label>
                <Input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mode
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (Days)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thumbnail Image URL
                </label>
                <Input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Step 1 Changes'}
              </Button>
            </div>
          </DashboardSection>
        </form>
      )}

      {/* STEP 2: Classification & Instructor */}
      {activeStep === 2 && (
        <form onSubmit={handleSaveBasicInfo} className="space-y-6">
          <DashboardSection
            title="Classification & Instructors"
            subtitle="Link course to appropriate subcategories and faculty members."
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
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
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
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
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
                  Primary Instructor (From Phase 5 Registry)
                </label>
                <select
                  value={selectedInstructorId}
                  onChange={(e) => setSelectedInstructorId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
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

            <div className="flex justify-end pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Step 2 Changes'}
              </Button>
            </div>
          </DashboardSection>
        </form>
      )}

      {/* STEP 3: Pricing & Complete Course Content Enhancements */}
      {activeStep === 3 && (
        <div className="space-y-6">
          {/* Sub-Tabs for Step 3 */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
            {STEP_3_TABS.map((tab) => {
              const isCurrent = activeStep3Tab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveStep3Tab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 3A: Commercial Pricing & Policies */}
          {activeStep3Tab === 'pricing' && (
            <form onSubmit={handleSavePricing} className="space-y-6">
              <DashboardSection
                title="Commercial Pricing & Refund Policies"
                subtitle="Configure baseline fee structure, promotional discounts, GST rules, and cancellation policies."
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Regular Price (INR) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      disabled={isFree}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Promotional Offer Price (INR)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      disabled={isFree}
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Currency
                    </label>
                    <Input
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      placeholder="INR"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <label htmlFor="isFree" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      100% Free / Community Course
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="taxInclusive"
                      checked={taxInclusive}
                      onChange={(e) => setTaxInclusive(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <label htmlFor="taxInclusive" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Price is Tax Inclusive (GST)
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      GST Percentage (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Refund Guarantee Window (Days)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={refundDays}
                      onChange={(e) => setRefundDays(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Refund Policy Notice
                    </label>
                    <Input
                      placeholder="e.g. 7-day money back guarantee with 100% refund."
                      value={refundPolicy}
                      onChange={(e) => setRefundPolicy(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? 'Saving...' : 'Save Pricing & Policies'}
                  </Button>
                </div>
              </DashboardSection>
            </form>
          )}

          {/* 3B: Course Points & Highlights */}
          {activeStep3Tab === 'points' && (
            <div className="space-y-6">
              <DashboardSection
                title="Course Key Highlights & Points"
                subtitle="Highlight key outcomes, covered tools, prerequisites, and mandatory background skills."
              >
                {/* Add Point Form */}
                <form onSubmit={handleAddPoint} className="flex flex-col sm:flex-row gap-2 mb-6">
                  <select
                    value={newPointType}
                    onChange={(e) => setNewPointType(e.target.value as CoursePointType)}
                    className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shrink-0 sm:w-48"
                  >
                    <option value="learn">What You&apos;ll Learn</option>
                    <option value="tool">Tool / Tech Covered</option>
                    <option value="prerequisite">Prerequisite</option>
                    <option value="required_skill">Required Skill</option>
                  </select>
                  <Input
                    placeholder="Enter highlight description (e.g. Master React Server Components & Action Hooks)..."
                    value={newPointText}
                    onChange={(e) => setNewPointText(e.target.value)}
                    className="text-xs flex-1"
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs shrink-0 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Highlight
                  </Button>
                </form>

                {/* Filter Toolbar */}
                <div className="flex items-center gap-1.5 mb-4">
                  {['all', 'learn', 'tool', 'prerequisite', 'required_skill'].map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setPointTypeFilter(f)}
                      className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                        pointTypeFilter === f
                          ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {f === 'all'
                        ? 'All'
                        : f === 'learn'
                        ? 'Learn'
                        : f === 'tool'
                        ? 'Tools'
                        : f === 'prerequisite'
                        ? 'Prerequisites'
                        : 'Required Skills'}
                    </button>
                  ))}
                </div>

                {/* Points List */}
                {points.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-xl text-slate-400 text-xs">
                    No highlights added yet. Use the form above to add learning points and prerequisites.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {points
                      .filter((p) => pointTypeFilter === 'all' || p.point_type === pointTypeFilter)
                      .map((p, idx) => {
                        const isEditing = editingPointId === p.id;
                        return (
                          <div
                            key={p.id || idx}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                              <Badge variant="default" className="text-[10px] uppercase shrink-0">
                                {p.point_type.replace('_', ' ')}
                              </Badge>

                              {isEditing ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <Input
                                    value={editingPointText}
                                    onChange={(e) => setEditingPointText(e.target.value)}
                                    className="text-xs"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEditedPoint(p.id)}
                                    className="text-xs bg-teal-600 text-white"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingPointId(null)}
                                    className="text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-slate-800 dark:text-slate-200 truncate">
                                  {p.text}
                                </span>
                              )}
                            </div>

                            {!isEditing && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMovePoint(idx, 'up')}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === points.length - 1}
                                  onClick={() => handleMovePoint(idx, 'down')}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPointId(p.id || idx);
                                    setEditingPointText(p.text);
                                  }}
                                  className="p-1 text-slate-500 hover:text-slate-800"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePoint(idx)}
                                  className="p-1 text-rose-500 hover:text-rose-700"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </DashboardSection>
            </div>
          )}

          {/* 3C: Career Benefits */}
          {activeStep3Tab === 'benefits' && (
            <form onSubmit={handleSaveBenefits} className="space-y-6">
              <DashboardSection
                title="Career Perks & Support Features"
                subtitle="Configure verifiable benefits, certifications, and career support included with enrollment."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={benefitsData.certificate_enabled}
                        onChange={(e) =>
                          setBenefitsData((prev) => ({
                            ...prev,
                            certificate_enabled: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-teal-600"
                      />
                      <span>Completion Certification Enabled</span>
                    </label>
                    <Input
                      placeholder="Certificate title..."
                      value={benefitsData.certificate_type || ''}
                      disabled={!benefitsData.certificate_enabled}
                      onChange={(e) =>
                        setBenefitsData((prev) => ({
                          ...prev,
                          certificate_type: e.target.value,
                        }))
                      }
                      className="text-xs"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={benefitsData.lifetime_access}
                        onChange={(e) =>
                          setBenefitsData((prev) => ({
                            ...prev,
                            lifetime_access: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-teal-600"
                      />
                      <span>Lifetime Access to Content</span>
                    </label>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">
                        Access Duration in Days (if not lifetime)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        disabled={benefitsData.lifetime_access}
                        value={benefitsData.access_duration_days}
                        onChange={(e) =>
                          setBenefitsData((prev) => ({
                            ...prev,
                            access_duration_days: Number(e.target.value),
                          }))
                        }
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={benefitsData.career_support_enabled}
                      onChange={(e) =>
                        setBenefitsData((prev) => ({
                          ...prev,
                          career_support_enabled: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Career Mentorship</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={benefitsData.mock_interviews}
                      onChange={(e) =>
                        setBenefitsData((prev) => ({
                          ...prev,
                          mock_interviews: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>1:1 Mock Interviews</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={benefitsData.resume_support}
                      onChange={(e) =>
                        setBenefitsData((prev) => ({
                          ...prev,
                          resume_support: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Resume & CV Review</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={benefitsData.placement_assistance}
                      onChange={(e) =>
                        setBenefitsData((prev) => ({
                          ...prev,
                          placement_assistance: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Placement Assistance</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={benefitsData.internship_support}
                      onChange={(e) =>
                        setBenefitsData((prev) => ({
                          ...prev,
                          internship_support: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Internship Opportunity</span>
                  </label>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                      Hands-on Projects Count
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={benefitsData.project_count}
                      onChange={(e) =>
                        setBenefitsData((prev) => ({
                          ...prev,
                          project_count: Number(e.target.value),
                        }))
                      }
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? 'Saving...' : 'Save Benefits & Perks'}
                  </Button>
                </div>
              </DashboardSection>
            </form>
          )}

          {/* 3D: FAQs */}
          {activeStep3Tab === 'faqs' && (
            <div className="space-y-6">
              <DashboardSection
                title="Frequently Asked Questions (FAQs)"
                subtitle="Address student inquiries about prerequisites, batch schedules, and certifications."
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-slate-500">
                    Total {faqsList.length} FAQs configured for this course.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditingFaqIndex(null);
                      setFaqQuestion('');
                      setFaqAnswer('');
                      setFaqModalOpen(true);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add FAQ
                  </Button>
                </div>

                {faqsList.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-xl text-slate-400 text-xs">
                    No FAQs added yet. Click &quot;Add FAQ&quot; above to create common questions and answers.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faqsList.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block">
                              Q: {faq.question}
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              A: {faq.answer}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveFaq(idx, 'up')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === faqsList.length - 1}
                              onClick={() => handleMoveFaq(idx, 'down')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFaqIndex(idx);
                                setFaqQuestion(faq.question);
                                setFaqAnswer(faq.answer);
                                setFaqModalOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-slate-800"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(idx)}
                              className="p-1 text-rose-500 hover:text-rose-700"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardSection>

              {/* FAQ Modal */}
              {faqModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {editingFaqIndex !== null ? 'Edit FAQ' : 'Add New FAQ'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setFaqModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveFaq} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Question *
                        </label>
                        <Input
                          value={faqQuestion}
                          onChange={(e) => setFaqQuestion(e.target.value)}
                          placeholder="e.g. Do I need prior coding experience?"
                          required
                          className="text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Answer *
                        </label>
                        <textarea
                          rows={4}
                          value={faqAnswer}
                          onChange={(e) => setFaqAnswer(e.target.value)}
                          placeholder="Detailed answer explaining requirements..."
                          required
                          className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFaqModalOpen(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                        >
                          Save FAQ
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3E: Testimonials */}
          {activeStep3Tab === 'testimonials' && (
            <div className="space-y-6">
              <DashboardSection
                title="Student Testimonials & Alumni Reviews"
                subtitle="Showcase verified alumni success stories and video reviews."
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-slate-500">
                    Total {testimonialsList.length} reviews and testimonials.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditingTestimonialIndex(null);
                      setTestimonialName('');
                      setTestimonialText('');
                      setTestimonialPhotoUrl('');
                      setTestimonialVideoUrl('');
                      setTestimonialIsActive(true);
                      setTestimonialModalOpen(true);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Testimonial
                  </Button>
                </div>

                {testimonialsList.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-xl text-slate-400 text-xs">
                    No testimonials configured yet. Click &quot;Add Testimonial&quot; to publish student feedback.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {testimonialsList.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {t.name}
                          </span>
                          <Badge variant={t.is_active ? 'success' : 'default'} className="text-[10px]">
                            {t.is_active ? 'ACTIVE' : 'HIDDEN'}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 italic line-clamp-3">
                          &quot;{t.text}&quot;
                        </p>
                        {(t.video_url || t.photo_url) && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            {t.video_url && <span>• Video Attached</span>}
                            {t.photo_url && <span>• Photo Attached</span>}
                          </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTestimonialIndex(idx);
                              setTestimonialName(t.name);
                              setTestimonialText(t.text);
                              setTestimonialPhotoUrl(t.photo_url || '');
                              setTestimonialVideoUrl(t.video_url || '');
                              setTestimonialIsActive(Boolean(t.is_active));
                              setTestimonialModalOpen(true);
                            }}
                            className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTestimonial(idx)}
                            className="text-rose-500 hover:text-rose-700 text-[11px] flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardSection>

              {/* Testimonial Modal */}
              {testimonialModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {editingTestimonialIndex !== null ? 'Edit Testimonial' : 'Add Testimonial'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setTestimonialModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveTestimonial} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Student Name *
                        </label>
                        <Input
                          value={testimonialName}
                          onChange={(e) => setTestimonialName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          required
                          className="text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Review Text *
                        </label>
                        <textarea
                          rows={3}
                          value={testimonialText}
                          onChange={(e) => setTestimonialText(e.target.value)}
                          placeholder="Student feedback and achievements..."
                          required
                          className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Photo URL
                          </label>
                          <Input
                            value={testimonialPhotoUrl}
                            onChange={(e) => setTestimonialPhotoUrl(e.target.value)}
                            placeholder="https://..."
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Video URL
                          </label>
                          <Input
                            value={testimonialVideoUrl}
                            onChange={(e) => setTestimonialVideoUrl(e.target.value)}
                            placeholder="YouTube or Vimeo URL"
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={testimonialIsActive}
                          onChange={(e) => setTestimonialIsActive(e.target.checked)}
                          className="rounded border-slate-300 text-teal-600"
                        />
                        <span>Active and Visible to Public</span>
                      </label>

                      <div className="flex justify-end gap-2 pt-3 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTestimonialModalOpen(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                        >
                          Save Testimonial
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3F: Course Materials */}
          {activeStep3Tab === 'materials' && (
            <div className="space-y-6">
              <DashboardSection
                title="Course Learning Materials & Resources"
                subtitle="Manage syllabi, project starter kits, lecture notes, and offline worksheets."
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-slate-500">
                    Total {materialsList.length} downloadable materials configured.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setMaterialTitle('');
                      setMaterialType('notes');
                      setMaterialFilePath('');
                      setMaterialIsPreview(false);
                      setMaterialRequiresEnrollment(true);
                      setMaterialModalOpen(true);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Material
                  </Button>
                </div>

                {materialsList.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-xl text-slate-400 text-xs">
                    No course materials uploaded yet. Click &quot;Add Material&quot; to attach syllabus or worksheets.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {materialsList.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Package className="w-5 h-5 text-teal-600 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {m.title}
                              </span>
                              <Badge variant="default" className="text-[10px] uppercase">
                                {m.material_type}
                              </Badge>
                              {m.is_preview && (
                                <Badge variant="accent" className="text-[10px]">
                                  Free Preview
                                </Badge>
                              )}
                              {m.requires_enrollment && (
                                <Badge variant="warning" className="text-[10px]">
                                  Enrollment Locked
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                              {m.file_path}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMaterial(m.id)}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardSection>

              {/* Material Modal */}
              {materialModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Add Course Material
                      </h3>
                      <button
                        type="button"
                        onClick={() => setMaterialModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveMaterial} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Resource Title *
                        </label>
                        <Input
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                          placeholder="e.g. Complete Course Syllabus & Schedule"
                          required
                          className="text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Material Type *
                          </label>
                          <select
                            value={materialType}
                            onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
                          >
                            <option value="syllabus">Syllabus</option>
                            <option value="brochure">Brochure</option>
                            <option value="notes">Lecture Notes</option>
                            <option value="worksheet">Worksheet</option>
                            <option value="project">Project Archive</option>
                            <option value="recording">Session Recording</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Quick Upload Attachment
                          </label>
                          <input
                            type="file"
                            onChange={handleMaterialFileUpload}
                            disabled={isUploadingMaterial}
                            className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          />
                          {isUploadingMaterial && (
                            <span className="text-[10px] text-teal-600">Uploading to server...</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          File Path / Server Location *
                        </label>
                        <Input
                          value={materialFilePath}
                          onChange={(e) => setMaterialFilePath(e.target.value)}
                          placeholder="/private/materials/..."
                          required
                          className="text-xs font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={materialIsPreview}
                            onChange={(e) => setMaterialIsPreview(e.target.checked)}
                            className="rounded border-slate-300 text-teal-600"
                          />
                          <span>Public Preview</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={materialRequiresEnrollment}
                            onChange={(e) => setMaterialRequiresEnrollment(e.target.checked)}
                            className="rounded border-slate-300 text-teal-600"
                          />
                          <span>Requires Active Enrollment</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setMaterialModalOpen(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                        >
                          Save Material
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3G: Installments & Offers */}
          {activeStep3Tab === 'installments' && (
            <div className="space-y-6">
              {/* Installment Plans */}
              <DashboardSection
                title="EMI & Split Payment Plans"
                subtitle="Configure multi-part payment plans for student admissions."
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-slate-500">
                    {installmentsList.length} installment options active.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditingInstallmentId(null);
                      setInstallmentPlanName('3-Part Monthly EMI');
                      setInstallmentCount(3);
                      setInstallmentAmount(Math.round(price / 3));
                      setInstallmentIntervalDays(30);
                      setInstallmentIsActive(true);
                      setInstallmentModalOpen(true);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Plan
                  </Button>
                </div>

                {installmentsList.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-xl text-slate-400 text-xs">
                    No installment plans configured. Students must pay the full fee upfront.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {installmentsList.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {p.plan_name}
                            </span>
                            <Badge variant={p.is_active ? 'success' : 'default'} className="text-[10px]">
                              {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </Badge>
                          </div>
                          <span className="text-slate-500 text-[11px]">
                            {p.installment_count} payments of ₹{p.installment_amount} every {p.interval_days} days (Total: ₹{p.installment_count * p.installment_amount})
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteInstallment(p.id)}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardSection>

              {/* Installment Modal */}
              {installmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {editingInstallmentId ? 'Edit Installment Plan' : 'Add Installment Plan'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setInstallmentModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveInstallment} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Plan Name *
                        </label>
                        <Input
                          value={installmentPlanName}
                          onChange={(e) => setInstallmentPlanName(e.target.value)}
                          placeholder="e.g. 3-Part Monthly Installment"
                          required
                          className="text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Parts (Count) *
                          </label>
                          <Input
                            type="number"
                            min={2}
                            value={installmentCount}
                            onChange={(e) => setInstallmentCount(Number(e.target.value))}
                            required
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Amount per Part (₹) *
                          </label>
                          <Input
                            type="number"
                            min={1}
                            value={installmentAmount}
                            onChange={(e) => setInstallmentAmount(Number(e.target.value))}
                            required
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                          Interval between Payments (Days) *
                        </label>
                        <Input
                          type="number"
                          min={1}
                          value={installmentIntervalDays}
                          onChange={(e) => setInstallmentIntervalDays(Number(e.target.value))}
                          required
                          className="text-xs"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={installmentIsActive}
                          onChange={(e) => setInstallmentIsActive(e.target.checked)}
                          className="rounded border-slate-300 text-teal-600"
                        />
                        <span>Active for Admissions</span>
                      </label>

                      <div className="flex justify-end gap-2 pt-3 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setInstallmentModalOpen(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                        >
                          Save Plan
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Promotional Offers */}
              <DashboardSection
                title="Promotional Discounts & Coupon Offers"
                subtitle="Create time-limited discounts and promo codes for this course."
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-slate-500">
                    {offersList.length} promotional offers configured.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditingOfferId(null);
                      setOfferName('');
                      setOfferDiscountType('percentage');
                      setOfferDiscountValue(20);
                      setOfferCouponCode('');
                      setOfferStartsAt(new Date().toISOString().slice(0, 16));
                      const nextMonth = new Date();
                      nextMonth.setDate(nextMonth.getDate() + 30);
                      setOfferEndsAt(nextMonth.toISOString().slice(0, 16));
                      setOfferUsageLimit('');
                      setOfferPerUserLimit(1);
                      setOfferIsActive(true);
                      setOfferModalOpen(true);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Offer
                  </Button>
                </div>

                {offersList.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-xl text-slate-400 text-xs">
                    No active discount offers. Click &quot;Add Offer&quot; to configure a promotion.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {offersList.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {o.offer_name}
                            </span>
                            {o.coupon_code && (
                              <Badge variant="accent" className="text-[10px] font-mono">
                                {o.coupon_code}
                              </Badge>
                            )}
                            <Badge variant={o.is_active ? 'success' : 'default'} className="text-[10px]">
                              {o.discount_type === 'percentage'
                                ? `${o.discount_value}% OFF`
                                : `₹${o.discount_value} OFF`}
                            </Badge>
                          </div>
                          <span className="text-slate-500 text-[11px]">
                            Valid: {new Date(o.starts_at).toLocaleDateString()} to {new Date(o.ends_at).toLocaleDateString()} • Used: {o.usage_count || 0} times
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOffer(o.id)}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardSection>

              {/* Offer Modal */}
              {offerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {editingOfferId ? 'Edit Promotional Offer' : 'Add Promotional Offer'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setOfferModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveOffer} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Offer Name *
                        </label>
                        <Input
                          value={offerName}
                          onChange={(e) => setOfferName(e.target.value)}
                          placeholder="e.g. Diwali Early Bird 2026"
                          required
                          className="text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Discount Type *
                          </label>
                          <select
                            value={offerDiscountType}
                            onChange={(e) =>
                              setOfferDiscountType(e.target.value as 'percentage' | 'fixed')
                            }
                            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Discount Value *
                          </label>
                          <Input
                            type="number"
                            min={1}
                            max={offerDiscountType === 'percentage' ? 100 : undefined}
                            value={offerDiscountValue}
                            onChange={(e) => setOfferDiscountValue(Number(e.target.value))}
                            required
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                          Coupon Code (Optional)
                        </label>
                        <Input
                          value={offerCouponCode}
                          onChange={(e) => setOfferCouponCode(e.target.value.toUpperCase())}
                          placeholder="e.g. EARLY20"
                          className="text-xs font-mono uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Starts At *
                          </label>
                          <Input
                            type="datetime-local"
                            value={offerStartsAt}
                            onChange={(e) => setOfferStartsAt(e.target.value)}
                            required
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Ends At *
                          </label>
                          <Input
                            type="datetime-local"
                            value={offerEndsAt}
                            onChange={(e) => setOfferEndsAt(e.target.value)}
                            required
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={offerIsActive}
                          onChange={(e) => setOfferIsActive(e.target.checked)}
                          className="rounded border-slate-300 text-teal-600"
                        />
                        <span>Active for checkout</span>
                      </label>

                      <div className="flex justify-end gap-2 pt-3 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setOfferModalOpen(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                        >
                          Save Offer
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Curriculum Builder */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <DashboardSection
            title="Curriculum Modules & Lessons"
            subtitle="Structure topics into chronological learning modules and individual lessons. Use the up and down controls to adjust sequence."
          >
            {/* Create Module Form */}
            <form onSubmit={handleCreateModule} className="flex gap-2 mb-6">
              <Input
                placeholder="New module title (e.g. Module 1: Introduction to Architecture)..."
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                className="text-xs"
              />
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Module
              </Button>
            </form>

            {isCurriculumLoading ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading modules...</p>
            ) : modules.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No curriculum modules yet</p>
                <p className="text-xs mt-1">Add your first module above to begin structuring lessons.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                  >
                    {/* Module Header */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {mod.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({mod.lessons?.length || 0} lessons)
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Module Reordering Controls */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveModule(idx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Module Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === modules.length - 1}
                          onClick={() => handleMoveModule(idx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Module Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveModuleForLesson(mod.id)}
                          className="text-xs flex items-center gap-1 text-teal-700 ml-2"
                        >
                          <Plus className="w-3 h-3" />
                          Add Lesson
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteModule(mod.id)}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Lesson Add Box for this Module */}
                    {activeModuleForLesson === mod.id && (
                      <form
                        onSubmit={handleCreateLesson}
                        className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border-b border-teal-200 dark:border-teal-800 space-y-3"
                      >
                        <span className="text-xs font-semibold text-teal-900 dark:text-teal-200 block">
                          Add Lesson to &quot;{mod.title}&quot;
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <Input
                            placeholder="Lesson Title..."
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            className="text-xs sm:col-span-2"
                            required
                          />
                          <select
                            value={newLessonType}
                            onChange={(e) => setNewLessonType(e.target.value as LessonType)}
                            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
                          >
                            <option value="video">Video</option>
                            <option value="article">Article / Reading</option>
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                          </select>
                          <Input
                            type="number"
                            placeholder="Duration (sec)"
                            value={newLessonDuration}
                            onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                            className="text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Input
                            placeholder="Content URL (Vimeo, YouTube, Drive or file path)..."
                            value={newLessonUrl}
                            onChange={(e) => setNewLessonUrl(e.target.value)}
                            className="text-xs flex-1"
                          />
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newLessonPreview}
                              onChange={(e) => setNewLessonPreview(e.target.checked)}
                              className="rounded border-slate-300 text-teal-600"
                            />
                            Free Preview
                          </label>
                          <Button
                            type="submit"
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs shrink-0"
                          >
                            Save Lesson
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveModuleForLesson(null)}
                            className="text-xs shrink-0"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Lessons list */}
                    <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800">
                      {mod.lessons && mod.lessons.length > 0 ? (
                        mod.lessons.map((les, lIdx) => (
                          <div
                            key={les.id}
                            className="flex items-center justify-between py-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-mono">{lIdx + 1}.</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {les.title}
                              </span>
                              <Badge variant="default" className="text-[10px] uppercase">
                                {les.lesson_type}
                              </Badge>
                              {les.is_preview && (
                                <Badge variant="accent" className="text-[10px]">
                                  FREE PREVIEW
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-slate-500">
                              <span>{Math.round((les.duration_seconds || 0) / 60)} mins</span>

                              {/* Lesson Reordering Controls */}
                              <button
                                type="button"
                                disabled={lIdx === 0}
                                onClick={() => handleMoveLesson(idx, lIdx, 'up')}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Lesson Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={lIdx === (mod.lessons?.length || 0) - 1}
                                onClick={() => handleMoveLesson(idx, lIdx, 'down')}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Lesson Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(les.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 ml-1"
                                title="Delete Lesson"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2 text-center">
                          No lessons in this module.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>
      )}

      {/* STEP 5: Batches Manager */}
      {activeStep === 5 && (
        <div className="space-y-6">
          <DashboardSection
            title="Scheduled Training Batches"
            subtitle="Create, coordinate, and edit cohort start dates, student capacities, and schedules."
          >
            {/* Create Batch Form */}
            <form
              onSubmit={handleCreateBatch}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 space-y-4 mb-6"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Add New Course Batch
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  placeholder="Batch Name (e.g. Weekend Batch - Nov 2026)"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                  className="text-xs sm:col-span-2"
                />
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value as BatchStatus)}
                  className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
                >
                  <option value="open">Open for Admission</option>
                  <option value="full">Batch Full</option>
                  <option value="closed">Closed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={batchStartDate}
                    onChange={(e) => setBatchStartDate(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    End Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={batchEndDate}
                    onChange={(e) => setBatchEndDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    Schedule Details
                  </label>
                  <Input
                    placeholder="e.g. Sat-Sun 10am-1pm"
                    value={batchClassTiming}
                    onChange={(e) => setBatchClassTiming(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    Capacity (Seats) *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={batchSeats}
                    onChange={(e) => setBatchSeats(Number(e.target.value))}
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save Batch
                </Button>
              </div>
            </form>

            {/* Batches List */}
            {isBatchesLoading ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading batches...</p>
            ) : batches.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No batches configured</p>
                <p className="text-xs mt-1">Create cohorts to organize student enrollments and scheduling.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {batches.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {b.batch_name}
                        </span>
                        <Badge
                          variant={
                            b.status === 'open'
                              ? 'success'
                              : b.status === 'full'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {b.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Starts: {b.start_date}</span>
                        {b.end_date && <span>• Ends: {b.end_date}</span>}
                        {b.class_timing && <span>• {b.class_timing}</span>}
                        {b.class_days && <span>• Days: {b.class_days}</span>}
                        {b.location && <span>• Location: {b.location}</span>}
                        <span>• Enrolled: {b.enrolled_count || 0} / {b.total_seats} seats</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditBatch(b)}
                        className="text-xs flex items-center gap-1 text-slate-700 dark:text-slate-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBatch(b.id)}
                        className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          {/* Edit Batch Modal */}
          {editBatchModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Edit Batch Cohort
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditBatchModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleUpdateBatch} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Batch Name *
                    </label>
                    <Input
                      value={editBatchName}
                      onChange={(e) => setEditBatchName(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                        Status *
                      </label>
                      <select
                        value={editBatchStatus}
                        onChange={(e) => setEditBatchStatus(e.target.value as BatchStatus)}
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
                      >
                        <option value="open">Open</option>
                        <option value="full">Full</option>
                        <option value="closed">Closed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                        Total Capacity (Seats) *
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={editBatchSeats}
                        onChange={(e) => setEditBatchSeats(Number(e.target.value))}
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                        Start Date *
                      </label>
                      <Input
                        type="date"
                        value={editBatchStartDate}
                        onChange={(e) => setEditBatchStartDate(e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={editBatchEndDate}
                        onChange={(e) => setEditBatchEndDate(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                        Class Days
                      </label>
                      <Input
                        placeholder="e.g. Sat-Sun"
                        value={editBatchClassDays}
                        onChange={(e) => setEditBatchClassDays(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                        Class Timing
                      </label>
                      <Input
                        placeholder="e.g. 10:00 AM - 1:00 PM"
                        value={editBatchClassTiming}
                        onChange={(e) => setEditBatchClassTiming(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                        Enrollment Deadline
                      </label>
                      <Input
                        type="date"
                        value={editBatchDeadline}
                        onChange={(e) => setEditBatchDeadline(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                        Location / Platform
                      </label>
                      <Input
                        placeholder="e.g. Online Zoom or Room 3"
                        value={editBatchLocation}
                        onChange={(e) => setEditBatchLocation(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditBatchModalOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                    >
                      Update Batch
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: SEO & Publication Status */}
      {activeStep === 6 && (
        <div className="space-y-6">
          <DashboardSection
            title="SEO Optimization & Publication"
            subtitle="Configure search engine metadata and govern catalog visibility."
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SEO Meta Title
                </label>
                <Input
                  placeholder="e.g. Master Full Stack Web Development - Softmaxs"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  maxLength={70}
                />
                <span className="text-[11px] text-slate-500">Max 70 characters recommended for Google SERP</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Compelling 150-160 character snippet describing this course..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  maxLength={160}
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Catalog Publication State
                </span>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="courseStatus"
                      value="draft"
                      checked={status === 'draft'}
                      onChange={() => setStatus('draft')}
                      className="text-amber-600"
                    />
                    <span>Draft (Hidden from Public Catalog)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="courseStatus"
                      value="published"
                      checked={status === 'published'}
                      onChange={() => setStatus('published')}
                      className="text-emerald-600"
                    />
                    <span>Published (Active on Website & Admissions Open)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="courseStatus"
                      value="archived"
                      checked={status === 'archived'}
                      onChange={() => setStatus('archived')}
                      className="text-slate-600"
                    />
                    <span>Archived (Retired / No new admissions)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  onClick={handleSaveSeoAndStatus}
                  disabled={isSaving}
                  className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Updating...' : 'Publish / Update Status & SEO'}
                </Button>
              </div>
            </div>
          </DashboardSection>
        </div>
      )}
    </div>
  );
}
