import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/hello',
        destination: 'http://localhost:4000/api/hello',
      },
    ];
  },
};

export default nextConfig;
