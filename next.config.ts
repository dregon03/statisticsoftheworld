import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['jspdf', 'jspdf-autotable'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // www → non-www redirect (fixes GSC 404 for http://www.statisticsoftheworld.com/)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.statisticsoftheworld.com' }],
        destination: 'https://statisticsoftheworld.com/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/sitemap/:id.xml',
        destination: '/api/sitemap/:id',
      },
    ];
  },
};

export default nextConfig;
