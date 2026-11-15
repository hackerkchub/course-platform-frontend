import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Course Platform',
  description:
    'Find answers about courses, live training, enrollment, curriculum, mentorship and learning support.',
  alternates: {
    canonical: `${getSiteUrl()}/faq`,
  },
  openGraph: {
    title: 'Frequently Asked Questions | Course Platform',
    description:
      'Find answers about courses, live training, enrollment, curriculum, mentorship and learning support.',
    url: `${getSiteUrl()}/faq`,
    type: 'website',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
