import type { NextConfig } from 'next';

const backendUrl = (
  process.env.BACKEND_URL ||
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.guidexa.in'
)
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

const nextConfig: NextConfig = {
  output: 'standalone',
  // Proxy API and static upload requests to the backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/files/:path*',
        destination: `${backendUrl}/files/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.guidexa.in',
        pathname: '/files/**',
      },
      {
        protocol: 'https',
        hostname: 'api.softmaxs.com',
        pathname: '/files/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/files/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
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
