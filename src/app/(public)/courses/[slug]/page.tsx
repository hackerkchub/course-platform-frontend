import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { CourseDetailPayload, CourseCard as CourseCardType } from '@/types/course';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { CourseDetailView } from '@/components/courses/course-detail-view';
import { getSiteUrl } from '@/lib/site-url';

const siteUrl = getSiteUrl();

interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await serverFetch<ApiResponse<CourseDetailPayload>>(
      API_ENDPOINTS.courses.bySlug(slug),
      { revalidate: 60 }
    );
    const course = res?.data as unknown as CourseDetailPayload;
    if (!course || !course.basic) {
      return {
        title: 'Course Not Found | Course Platform',
      };
    }

    const title = course.seo?.seo_title || `${course.basic.course_name} | Live Cohort Mastery`;
    const description =
      course.seo?.seo_description ||
      course.basic.short_description ||
      'Master modern software engineering with verified curriculum and veteran mentorship.';
    const ogImage = course.seo?.og_image_url || course.media?.thumbnail_url || `${siteUrl}/images/og-default.jpg`;
    const canonical = `${siteUrl}/courses/${slug}`;

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Course Platform',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: course.basic.course_name,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: 'Course Platform',
    };
  }
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;

  let course: CourseDetailPayload | null = null;
  try {
    const res = await serverFetch<ApiResponse<CourseDetailPayload>>(
      API_ENDPOINTS.courses.bySlug(slug),
      { revalidate: 60 }
    );
    course = (res?.data as unknown as CourseDetailPayload) || null;
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404) {
      notFound();
    }
    // Safe error handling for network failures, timeouts, and backend 5xx
    throw new Error('Course catalog service is temporarily unavailable');
  }

  if (!course || !course.basic) {
    notFound();
  }

  // Fetch related courses from the same category, or popular catalog
  let relatedCourses: CourseCardType[] = [];
  try {
    const categorySlug = course.basic.category?.slug;
    const fetchUrl = categorySlug
      ? `${API_ENDPOINTS.courses.list}?category=${encodeURIComponent(categorySlug)}&limit=6`
      : `${API_ENDPOINTS.courses.list}?limit=6`;

    const relRes = await serverFetch<PaginatedResponse<CourseCardType>>(fetchUrl, {
      revalidate: 60,
    });
    const raw = relRes?.data;
    const list = Array.isArray(raw)
      ? raw
      : ((raw as unknown as { data?: CourseCardType[] })?.data || []);

    // Filter out current course and limit to max 3 items
    relatedCourses = list
      .filter((c) => c.id !== course?.basic.id && c.slug !== course?.basic.slug)
      .slice(0, 3);
  } catch {
    relatedCourses = [];
  }

  // Structured Data (JSON-LD)
  const isFree = Boolean(course.pricing.is_free) || course.pricing.price === 0;
  const currentPrice = course.pricing.offer_price ?? course.pricing.price;
  const reviewCount = Number(course.social_proof?.reviews_summary?.review_count || 0);
  const averageRating = Number(course.social_proof?.reviews_summary?.average_rating || 0);

  const courseJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.basic.course_name,
    description: course.basic.short_description || course.basic.description,
    provider: {
      '@type': 'Organization',
      name: 'Course Platform',
      url: siteUrl,
    },
    offers: {
      '@type': 'Offer',
      price: isFree ? 0 : currentPrice,
      priceCurrency: course.pricing.currency || 'INR',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/courses/${course.basic.slug}`,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: `${course.basic.duration_hours} Hours`,
    },
  };

  // Only emit aggregateRating when review_count > 0 and average_rating > 0
  if (reviewCount > 0 && averageRating > 0) {
    courseJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Courses',
        item: `${siteUrl}/courses`,
      },
      ...(course.basic.category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: course.basic.category.name,
              item: `${siteUrl}/courses?category=${course.basic.category.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: course.basic.course_name,
              item: `${siteUrl}/courses/${course.basic.slug}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: course.basic.course_name,
              item: `${siteUrl}/courses/${course.basic.slug}`,
            },
          ]),
    ],
  };

  return (
    <>
      {/* Inject JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <CourseDetailView course={course} relatedCourses={relatedCourses} />
    </>
  );
}
