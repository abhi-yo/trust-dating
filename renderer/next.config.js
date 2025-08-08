/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  output: isProd ? "export" : undefined,
  distDir: isProd ? "../renderer-dist" : ".next",
  assetPrefix: isProd ? "./" : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
