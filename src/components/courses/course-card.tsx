'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CourseCard as CourseCardType } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDuration } from '@/lib/utils';
import {
  Star,
  Clock,
  BookOpen,
  Calendar,
  Heart,
  Sparkles,
  Flame,
  GraduationCap,
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useAuth } from '@/providers/auth-provider';

interface CourseCardProps {
  course: CourseCardType;
  priority?: boolean;
}

export function CourseCard({ course }: CourseCardProps) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState<boolean>(Boolean(course.is_wishlisted));
  const [isTogglingWishlist, setIsTogglingWishlist] = useState<boolean>(false);

  const priceNum = Number(course.price || 0);
  const offerPriceNum = course.offer_price !== null && course.offer_price !== undefined ? Number(course.offer_price) : null;
  const isFree = Boolean(course.is_free) || priceNum === 0;
  const hasOffer = offerPriceNum !== null && offerPriceNum < priceNum && !isFree;
  const discountPercent = hasOffer ? Math.round(((priceNum - offerPriceNum) / priceNum) * 100) : 0;
  const currentPrice = hasOffer ? offerPriceNum : priceNum;

  const categoryName = course.category?.name || course.category_name;
  const categorySlug = course.category?.slug || course.category_slug;
  const instructorId = course.instructor?.id;
  const instructorName = course.instructor?.name;
  const instructorPhoto = course.instructor?.photo_url;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?returnUrl=/courses/${course.slug}`;
      return;
    }
    if (isTogglingWishlist) return;

    setIsTogglingWishlist(true);
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    try {
      if (nextState) {
        await apiClient.post(API_ENDPOINTS.wishlist.add(course.id));
      } else {
        await apiClient.delete(API_ENDPOINTS.wishlist.remove(course.id));
      }
    } catch {
      // Revert on error
      setIsWishlisted(!nextState);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <Card className="group relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900">
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_url}
            alt={course.alt_text || course.course_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-300">
            <GraduationCap className="w-12 h-12 text-blue-400 mb-2 opacity-80" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              {categoryName || 'Course'}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {course.is_trending && (
            <Badge variant="warning" className="shadow-sm gap-1 bg-amber-500 text-white border-0 font-medium text-xs">
              <Flame className="w-3 h-3 fill-current" />
              Trending
            </Badge>
          )}
          {course.is_featured && (
            <Badge variant="accent" className="shadow-sm gap-1 bg-indigo-600 text-white border-0 font-medium text-xs">
              <Sparkles className="w-3 h-3 fill-current" />
              Featured
            </Badge>
          )}
          {course.is_new && (
            <Badge variant="success" className="shadow-sm bg-emerald-600 text-white border-0 font-medium text-xs">
              New
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={isTogglingWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 shadow-md hover:scale-110 active:scale-95 transition-all z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'
            }`}
          />
        </button>

        {/* Level Pill */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-black/60 backdrop-blur-md text-white capitalize border border-white/10">
            {course.course_level}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          {categorySlug ? (
            <Link
              href={`/courses?category=${categorySlug}`}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[60%]"
            >
              {categoryName}
            </Link>
          ) : (
            <span>Course</span>
          )}

          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span>{Number(course.rating_avg || 0).toFixed(1)}</span>
            {course.rating_count > 0 && (
              <span className="text-slate-400 font-normal">({course.rating_count})</span>
            )}
          </div>
        </div>

        {/* Course Title */}
        <Link href={`/courses/${course.slug}`} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {course.course_name}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {course.short_description}
        </p>

        {/* Meta Stats Row (Duration & Lessons) */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDuration(course.duration_hours)}</span>
          </div>
          {course.total_lessons > 0 && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.total_lessons} Lessons</span>
            </div>
          )}
        </div>

        {/* Instructor Summary */}
        {instructorName && (
          instructorId ? (
            <Link
              href={`/instructors/${instructorId}`}
              onClick={(e) => e.stopPropagation()}
              className="group/inst inline-flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit max-w-full"
            >
              {instructorPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={instructorPhoto}
                  alt={instructorName}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 group-hover/inst:ring-blue-400 transition-all"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {instructorName.charAt(0)}
                </div>
              )}
              <span className="truncate font-medium group-hover/inst:underline">{instructorName}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
              {instructorPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={instructorPhoto}
                  alt={instructorName}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {instructorName.charAt(0)}
                </div>
              )}
              <span className="truncate font-medium">{instructorName}</span>
            </div>
          )
        )}

        {/* Next Batch Schedule Indicator */}
        {course.next_batch_start && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              Next Cohort: {new Date(course.next_batch_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
            {course.total_seats_available !== null && course.total_seats_available !== undefined && (
              <span className="ml-auto font-bold text-blue-800 dark:text-blue-200">
                {course.total_seats_available} seats left
              </span>
            )}
          </div>
        )}

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            {isFree ? (
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                FREE
              </span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(currentPrice)}
                </span>
                {hasOffer && (
                  <>
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(priceNum)}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <Link href={`/courses/${course.slug}`}>
            <Button size="sm" variant="primary" className="rounded-xl px-3.5 font-semibold">
              Explore
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
export default CourseCard;
