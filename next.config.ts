import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Map NEON_DATABASE_URL to DATABASE_URL for Prisma runtime
  env: {
    DATABASE_URL: process.env.NEON_DATABASE_URL,
  },
};

export default nextConfig;
