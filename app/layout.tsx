import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

// 폰트 설정
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

// 관리자 서버용 메타데이터로 변경합니다.
export const metadata: Metadata = {
  title: '관리자 시스템',
  description: '쇼핑몰 전용 관리자 대시보드 시스템입니다.',
}

// 사용자 서버에 있던 "Header(내비게이션 바)" 등의 잔재를 모두 지운, 가장 깨끗한 바탕의 레이아웃입니다.
// 이 프로젝트는 '관리자 서버' 하나만을 위한 것이기 때문입니다.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-900 text-slate-100`}>
        {/* 모든 페이지 콘텐츠가 렌더링될 메인 영역입니다. */}
        <main>{children}</main>
      </body>
    </html>
  )
}
