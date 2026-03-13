import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['i.pravatar.cc'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mdwcemrsqdamcxlnityq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },  
};

// module.exports = {
//   async rewrites() {
//     return [
//       {
//         source: '/api/hello',
//         destination: 'http://localhost:5000/api/hello',
//       },
//     ];
//   },
// };

export default nextConfig;
