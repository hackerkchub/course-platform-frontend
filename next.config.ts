import type { NextConfig } from 'next';

const internalBackendUrl = (
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.softmaxs.com'
)
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

const nextConfig: NextConfig = {
  // Proxy API and static upload requests to the backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${internalBackendUrl}/api/:path*`,
      },
      {
        source: '/files/:path*',
        destination: `${internalBackendUrl}/files/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.softmaxs.com',
        pathname: '/files/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
