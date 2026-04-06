'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 관리자(Admin) 전용 로그인 페이지 컴포넌트입니다.
// 일반 사용자 페이지와 확연히 분리된 어둡고 전문적인 디자인(Dark Mode) 테마를 사용합니다.
export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 관리자 로그인 버튼 클릭 시 호출되는 함수입니다.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // 기존 에러 메시지 초기화
    setIsLoading(true)

    try {
      // 위에서 만든 관리자 전용 API 라우트로 로그인 정보를 보냅니다.
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        // 서버에서 반환받은 에러 메시지를 표시합니다.
        throw new Error(data.message || '로그인에 실패했습니다.')
      }

      // 로그인이 성공하면 대시보드(관리자 메인) 페이지로 이동 시킵니다.
      // (대시보드는 아직 구현되지 않았지만 준비를 위해 설정해 둡니다)
      router.push('/admin/dashboard')
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('서버와의 통신 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // 관리자 페이지 특유의 무채색 배경을 시각적으로 강하게 표현합니다.
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white mb-2">
          Administrator Login
        </h2>
        <p className="text-center text-sm text-neutral-400">
          시스템 관리자 전용 접속 페이지
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-800 py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-neutral-700">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-300">
                관리자 아이디
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm placeholder-neutral-500 bg-neutral-900 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm placeholder-neutral-500 bg-neutral-900 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* 에러가 발생한 경우에만 경고 메시지를 보여줍니다. */}
            {error && (
              <div className="rounded-md bg-red-900/50 p-4 border border-red-500/50">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-200">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '로그인 처리 중...' : '관리자 계정으로 로그인'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
                ← 쇼핑몰 홈으로 돌아가기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
