/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  distDir: process.env.NODE_ENV === 'production' ? '../out' : '.next',
  basePath: process.env.NODE_ENV === 'production' ? '' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
