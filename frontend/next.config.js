/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://43.213.29.25:8080/api/v1/:path*',
      },
    ];
  },
}

module.exports = nextConfig
