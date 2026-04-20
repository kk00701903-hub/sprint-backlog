const isProd = process.env.NODE_ENV === 'production'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  output: 'export',
  basePath: '/sprint-backlog',
  assetPrefix: '/sprint-backlog/',
  distDir: 'dist',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig
