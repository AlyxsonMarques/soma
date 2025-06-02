import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
  images: {
    unoptimized: true,
    domains: ['localhost', '127.0.0.1', 'startmanutencao.com']
  }
};

export default nextConfig;
