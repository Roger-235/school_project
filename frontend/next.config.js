/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://43.213.29.25:8080/api/v1/:path*',
      },
      {
        source: '/students/:path*',
        destination: 'http://43.213.29.25:8080/students/:path*',
      },
      {
        source: '/students',
        destination: 'http://43.213.29.25:8080/students',
      },
      {
        source: '/schools/:path*',
        destination: 'http://43.213.29.25:8080/schools/:path*',
      },
      {
        source: '/schools',
        destination: 'http://43.213.29.25:8080/schools',
      },
      {
        source: '/sport-types/:path*',
        destination: 'http://43.213.29.25:8080/sport-types/:path*',
      },
      {
        source: '/sport-types',
        destination: 'http://43.213.29.25:8080/sport-types',
      },
      {
        source: '/sport-records/:path*',
        destination: 'http://43.213.29.25:8080/sport-records/:path*',
      },
      {
        source: '/sport-records',
        destination: 'http://43.213.29.25:8080/sport-records',
      },
      {
        source: '/counties/:path*',
        destination: 'http://43.213.29.25:8080/counties/:path*',
      },
      {
        source: '/counties',
        destination: 'http://43.213.29.25:8080/counties',
      },
    ];
  },
};

module.exports = nextConfig;
