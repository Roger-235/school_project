/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable standalone output for Docker deployment
  output: 'standalone',

  async rewrites() {
    // Use environment variable for backend URL, fallback to production
    const backendUrl = process.env.BACKEND_URL || 'http://43.213.29.25:8080';

    return {
      // beforeFiles runs BEFORE Next.js API routes, so backend requests
      // are proxied to the real backend instead of hitting mock API routes
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: `${backendUrl}/api/v1/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
