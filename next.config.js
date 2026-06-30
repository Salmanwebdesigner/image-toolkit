/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/image-toolkit",
  assetPrefix: "/image-toolkit",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;