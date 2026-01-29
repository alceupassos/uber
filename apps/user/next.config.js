/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/eden"],
  typescript: {
    // Skip type checking during build to avoid checking server code
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build - run separately
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.MAPBOX_API_KEY,
  },
};

export default nextConfig;
