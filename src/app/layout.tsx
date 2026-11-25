import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ToastProvider } from '@/components/ui/toast';
import { verifyServerSession } from '@/lib/auth/server-auth';
import { getSiteUrl } from '@/lib/site-url';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Guidexa — Build Skills That Build Your Future | Modern Technology Education',
    template: '%s | Guidexa',
  },
  description:
    'Learn in-demand technology skills, build real-world projects and prepare yourself for the opportunities of tomorrow with Guidexa.',
  keywords: [
    'software engineering',
    'web development',
    'full stack',
    'python programming',
    'data structures',
    'generative ai',
    'react course',
    'node.js',
    'project based learning',
    'certifications',
  ],
  authors: [{ name: 'Guidexa' }],
  creator: 'Guidexa',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Guidexa',
    title: 'Guidexa — Build Skills That Build Your Future | Modern Technology Education',
    description:
      'Learn in-demand technology skills, build real-world projects and prepare yourself for the opportunities of tomorrow with Guidexa.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guidexa — Build Skills That Build Your Future | Modern Technology Education',
    description:
      'Learn in-demand technology skills, build real-world projects and prepare yourself for the opportunities of tomorrow with Guidexa.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Authoritative server-side session lookup for instant SSR hydration
  const initialUser = await verifyServerSession();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} scroll-smooth`}>
      <body className="min-h-screen bg-slate-50/50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased flex flex-col">
        <QueryProvider>
          <AuthProvider initialUser={initialUser}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
