import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'gaderia.com.ua' },
      { protocol: 'https', hostname: 'gaderia.biz' },
    ],
  },
};

export default nextConfig;
