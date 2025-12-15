/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      // beforeFiles runs BEFORE Next.js API routes, so backend requests
      // are proxied to the real backend instead of hitting mock API routes
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: 'http://43.213.29.25:8080/api/v1/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
