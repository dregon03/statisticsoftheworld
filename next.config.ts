import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
