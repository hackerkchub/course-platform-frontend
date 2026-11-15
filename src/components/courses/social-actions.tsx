'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Share2, Check, MessageCircle } from 'lucide-react';

interface ShareButtonProps {
  courseId: number;
  courseTitle: string;
  className?: string;
}

export function ShareButton({ courseId, courseTitle, className }: ShareButtonProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleShare = async () => {
    // Silent telemetry
    apiClient.post(API_ENDPOINTS.analytics.share(courseId)).catch(() => {});

    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: courseTitle,
          text: `Check out ${courseTitle} on our Course Platform!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore copy error
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={`gap-1.5 text-xs ${className || ''}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </>
      )}
    </Button>
  );
}

interface WhatsAppEnquiryButtonProps {
  courseId: number;
  courseTitle: string;
  className?: string;
}

export function WhatsAppEnquiryButton({
  courseId,
  courseTitle,
  className,
}: WhatsAppEnquiryButtonProps) {
  const [showConfigNotice, setShowConfigNotice] = useState<boolean>(false);
  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const phone = rawPhone ? rawPhone.replace(/[^0-9]/g, '') : null;

  const handleWhatsAppClick = () => {
    // Silent telemetry
    apiClient.post(API_ENDPOINTS.analytics.enquiryClick(courseId)).catch(() => {});

    if (!phone) {
      setShowConfigNotice(true);
      return;
    }

    const message = encodeURIComponent(
      `Hello, I would like more information and batch details about the course: "${courseTitle}".`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full space-y-1.5">
      <Button
        variant="outline"
        size="lg"
        onClick={handleWhatsAppClick}
        className={`w-full border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 gap-2 font-semibold ${className || ''}`}
        aria-label="Enquire on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 fill-emerald-600/20 text-emerald-600" />
        <span>Chat on WhatsApp</span>
      </Button>

      {showConfigNotice && !phone && (
        <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-lg border border-amber-200 dark:border-amber-800 text-center leading-snug">
          Official WhatsApp admissions line is pending configuration. Please use the Book Demo session button.
        </p>
      )}
    </div>
  );
}
