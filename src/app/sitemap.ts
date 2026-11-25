import { MetadataRoute } from 'next';
import { serverFetch } from '@/lib/api/server';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { CourseCard, Category, InstructorProfile } from '@/types/course';
import { PaginatedResponse, ApiResponse } from '@/types/api';
import { getSiteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const currentDate = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/courses`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/instructors`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/why-choose-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const coursesRes = await serverFetch<PaginatedResponse<CourseCard>>(
      `${API_ENDPOINTS.courses.list}?limit=100`,
      { revalidate: 3600 }
    );
    const raw = coursesRes?.data;
    const courses = Array.isArray(raw) ? raw : ((raw as unknown as { data?: CourseCard[] })?.data || []);
    courseRoutes = courses.map((course) => ({
      url: `${siteUrl}/courses/${course.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // Graceful fallback if backend is unreachable during static build
    courseRoutes = [];
  }

  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const catRes = await serverFetch<ApiResponse<Category[]>>(
      API_ENDPOINTS.categories.list,
      { revalidate: 86400 }
    );
    const categories = (catRes?.data as unknown as Category[]) || [];
    if (Array.isArray(categories)) {
      categoryRoutes = categories.map((cat) => ({
        url: `${siteUrl}/categories/${cat.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    categoryRoutes = [];
  }

  let instructorRoutes: MetadataRoute.Sitemap = [];
  try {
    const insRes = await serverFetch<ApiResponse<InstructorProfile[]>>(
      API_ENDPOINTS.instructors.list,
      { revalidate: 86400 }
    );
    const instructors = (insRes?.data as unknown as InstructorProfile[]) || [];
    if (Array.isArray(instructors)) {
      instructorRoutes = instructors.map((ins) => ({
        url: `${siteUrl}/instructors/${ins.id}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    instructorRoutes = [];
  }

  return [...staticRoutes, ...courseRoutes, ...categoryRoutes, ...instructorRoutes];
}
