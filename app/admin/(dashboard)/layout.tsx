'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // 임시 로그아웃 처리 (토큰 삭제 등의 로직을 나중에 분리해야 함)
  const handleLogout = () => {
    // 임시로 그냥 프론트엔드에서 라우트 이동만 시켜줍니다.
    alert('로그아웃 되었습니다.')
    router.push('/admin/login')
  }

  // 메뉴 리스트 (경로와 메뉴명 매핑)
  const menuItems = [
    { name: 'Dashboard (대시보드)', path: '/admin/dashboard' },
    { name: 'Users (회원 관리)', path: '/admin/users' },
    { name: 'Products (상품 관리)', path: '/admin/products' },
    { name: 'Orders (주문 관리)', path: '/admin/orders' },
    { name: 'Settings (설정)', path: '/admin/settings' },
  ]

  return (
    // 전체 컨테이너: 어두운 배경(사이드바)과 밝은 배경(메인)의 대비를 주기 위해 bg-neutral-100 등을 사용
    <div className="flex min-h-screen bg-neutral-100 font-sans text-neutral-900">
      {/* 1. 사이드바 (Sidebar) - 좌측 영역 */}
      <aside className="flex hidden w-64 flex-shrink-0 flex-col bg-neutral-900 text-white md:flex">
        {/* 로고 영역 */}
        <div className="flex h-16 items-center bg-neutral-950 px-6">
          <Link href="/admin/dashboard" className="text-xl font-bold tracking-wider">
            ADMIN PANEL
          </Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Menu</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 font-medium text-white' // 현재 활성화된 메뉴
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white' // 비활성 메뉴
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* 사이드바 하단 정보 (예: 현재 버전 등) */}
        <div className="border-t border-neutral-800 p-4 text-xs text-neutral-500">v1.0.0 Admin</div>
      </aside>

      {/* 2. 메인 화면 영역 (Main Content) - 우측 영역 */}
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* 2-1. 상단 헤더 (Header) */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-8 shadow-sm">
          {/* 모바일에서 사이드바 여는 버튼(향후 구현) 및 현재 경로 간략 표시 */}
          <div className="text-xl font-semibold text-neutral-800">
            {menuItems.find((m) => m.path === pathname)?.name.split(' ')[0] || 'Dashboard'}
          </div>

          {/* 우측 프로필 및 로그아웃 버튼 */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-medium text-neutral-700">관리자님</span> 환영합니다.
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-200"
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* 2-2. 실제 페이지 컨텐츠가 렌더링되는 영역 (Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-neutral-50 p-8">{children}</div>
      </main>
    </div>
  )
}
