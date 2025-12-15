/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Main backend API proxy - /backend/* -> backend /api/v1/*
      // This avoids conflict with Next.js mock API routes at /api/v1/*
      {
        source: '/backend/:path*',
        destination: 'http://43.213.29.25:8080/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
