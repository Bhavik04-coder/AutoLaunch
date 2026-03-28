import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
  },

  // Turbopack native config — no custom CSS loaders needed
  // Turbopack handles @import "tailwindcss" natively without PostCSS
  turbopack: {},

  // Webpack fallback for non-turbopack builds
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;
