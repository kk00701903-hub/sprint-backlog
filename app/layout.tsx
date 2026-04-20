import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FaSS Platform — 스프린트 백로그 v1.0',
  description: '(주)제때 차세대 웹프레임워크 FaSS Platform 개발 표준 스프린트 백로그 | v1.0 | 2026-04-14 | 작성자: 서선범',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
