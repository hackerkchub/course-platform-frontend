import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Guidexa — Help & Student Support',
  description:
    'Find clear answers to common questions about Guidexa technology courses, curriculum, enrollment, payments, hands-on projects, certificates, and student support.',
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
  openGraph: {
    title: 'Frequently Asked Questions | Guidexa — Help & Student Support',
    description:
      'Find answers about Guidexa courses, learning experience, enrollment and platform features.',
    url: `${siteUrl}/faq`,
    siteName: 'Guidexa',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | Guidexa — Help & Student Support',
    description:
      'Find answers about Guidexa courses, learning experience, enrollment and platform features.',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
