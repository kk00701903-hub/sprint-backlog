/** @type {import('next').NextConfig} */

// GitHub Pages 배포 시 저장소 이름을 basePath로 사용
// 예) https://username.github.io/fass-sprint-backlog/
const isProd = process.env.NODE_ENV === 'production'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  images: { unoptimized: true },

  // GitHub Pages 서브 경로 지원
  basePath: basePath,
  assetPrefix: isProd && basePath ? basePath + '/' : '',
}

export default nextConfig
