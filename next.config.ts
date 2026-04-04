import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['jspdf', 'jspdf-autotable'],
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
