import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';

// Use verified production domain, avoiding localhost placeholders in metadata
const rawSiteUrl = getSiteUrl();
const siteUrl = rawSiteUrl && !rawSiteUrl.includes('localhost') ? rawSiteUrl : 'https://guidexa.in';

export const metadata: Metadata = {
  title: 'Contact Guidexa | Student Support & Admissions',
  description:
    'Get in touch with Guidexa for course inquiries, admissions guidance, curriculum details, and technical learning support. Operated under Softmaxs Solution LLP.',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'Contact Guidexa | Student Support & Admissions',
    description:
      'Have questions about our courses, admissions or learning programs? Our team is here to help you find the right direction.',
    url: `${siteUrl}/contact`,
    siteName: 'Guidexa',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Guidexa | Student Support & Admissions',
    description:
      'Have questions about our courses, admissions or learning programs? Our team is here to help you find the right direction.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
