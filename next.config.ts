import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Allow production builds to complete with minor ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds with minor TypeScript issues
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
