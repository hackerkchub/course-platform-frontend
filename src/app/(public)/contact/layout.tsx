import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Contact Us | Course Platform',
  description:
    'Contact Softmaxs Solution LLP for course enquiries, admissions information and training support.',
  alternates: {
    canonical: `${getSiteUrl()}/contact`,
  },
  openGraph: {
    title: 'Contact Us | Course Platform',
    description:
      'Contact Softmaxs Solution LLP for course enquiries, admissions information and training support.',
    url: `${getSiteUrl()}/contact`,
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
