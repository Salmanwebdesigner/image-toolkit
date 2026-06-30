const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  output: 'export',
  basePath: isProd ? '/image-toolkit' : '',
  assetPrefix: isProd ? '/image-toolkit/' : '/',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;