/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STATIC === 'true' ? 'export' : undefined,
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  basePath: process.env.BUILD_STATIC === 'true' ? '/pixel-heist' : undefined,
  assetPrefix: process.env.BUILD_STATIC === 'true' ? '/pixel-heist/' : undefined,
};

export default nextConfig;
