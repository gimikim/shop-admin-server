'use client'

import React, { useEffect, useState } from 'react'

// 유저 데이터 타입 정의 (DB 모델 기준)
interface User {
  _id: string
  name: string
  email: string
  username: string
  user_type: 'personal' | 'business'
  gender: string
  phoneNumber: string
  createdAt: string
  emailVerified: boolean
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // "상세/수정" 모달 관련 상태
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({ name: '', phoneNumber: '', user_type: 'personal' })
  const [isSaving, setIsSaving] = useState(false)

  // 1. 처음 마운트 될 때 방금 만든 회원 목록 API 스크립트를 호출합니다.
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        const data = await response.json()

        if (data.success) {
          setUsers(data.data)
        } else {
          setError(data.message || '데이터를 불러오지 못했습니다.')
        }
      } catch {
        setError('통신 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // CSV 형식으로 데이터를 내보내는 함수
  const handleExportData = () => {
    if (users.length === 0) {
      alert('내보낼 데이터가 없습니다.')
      return
    }

    // CSV의 헤더(첫 번째 줄) 작성
    const headers = ['ID', '이름', '이메일', '아이디', '회원분류', '연락처', '가입일시', '이메일인증여부']

    // 유저 데이터를 CSV 행(row) 형식 문자열 배열로 변환
    const csvRows = users.map((user) => {
      return [
        user._id,
        user.name,
        user.email,
        user.username,
        user.user_type === 'business' ? '사업자' : '개인',
        user.phoneNumber,
        new Date(user.createdAt).toLocaleString('ko-KR'),
        user.emailVerified ? 'Y' : 'N',
      ]
        .map((value) => `"${value}"`)
        .join(',') // 쉼표(,)나 공백이 들어간 데이터를 위해 쌍따옴표로 감쌈
    })

    // BOM(Byte Order Mark)을 추가하여 엑셀(Excel)에서 한글이 깨지지 않도록 처리
    const csvString = '\uFEFF' + [headers.join(','), ...csvRows].join('\n')

    // Blob 객체 생성 및 임시 다운로드 링크(anchor)를 만들어서 클릭 이벤트 발생
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    // 다운로드 될 파일 이름 지정 (예: users_2023-10-10.csv)
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 모달 열기
  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      phoneNumber: user.phoneNumber,
      user_type: user.user_type,
    })
  }

  // 모달 닫기
  const closeEditModal = () => {
    setSelectedUser(null)
  }

  // 수정 사항 서버에 저장
  const handleSaveChanges = async () => {
    if (!selectedUser) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })
      const data = await res.json()

      if (data.success) {
        alert('회원 정보가 성공적으로 수정되었습니다.')
        // 로컬 상태(users 배열) 즉시 업데이트
        setUsers(users.map((u) => (u._id === selectedUser._id ? ({ ...u, ...editFormData } as User) : u)))
        closeEditModal()
      } else {
        alert(data.message || '수정에 실패했습니다.')
      }
    } catch {
      alert('서버와의 통신 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 2. 상단 헤더: 타이틀과 추가 액션 버튼(현재는 동작없음) */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">회원 관리 (Users)</h1>
          <p className="mt-1 text-sm text-neutral-500">시스템에 가입된 모든 사용자 정보를 조회하고 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          {/* 엑셀(CSV) 다운로드 기능 버튼 */}
          <button
            onClick={handleExportData}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
          >
            데이터 내보내기
          </button>
        </div>
      </div>

      {/* 3. 데이터 테이블 영역 */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white text-sm shadow-sm">
        {/* 간단한 헤더 바 (검색 영역) */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium tracking-wide text-neutral-600">
              총 <span className="font-bold text-blue-600">{users.length}</span>명
            </span>
          </div>
          <div className="w-64">
            <input
              type="text"
              placeholder="이름 또는 이메일 검색..."
              className="w-full rounded-md border border-neutral-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 4. 상태 표시에 따른 분기 처리 */}
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500">데이터를 불러오는 중입니다...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">조회된 가입자가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead className="bg-neutral-50 font-medium text-neutral-500">
                <tr>
                  <th className="border-y border-neutral-200 px-6 py-4"># (ID)</th>
                  <th className="border-y border-neutral-200 px-6 py-4">이름 / 계정</th>
                  <th className="border-y border-neutral-200 px-6 py-4">회원 분류</th>
                  <th className="border-y border-neutral-200 px-6 py-4">연락처</th>
                  <th className="border-y border-neutral-200 px-6 py-4">가입일시</th>
                  <th className="border-y border-neutral-200 px-6 py-4 text-center">이메일 인증</th>
                  <th className="border-y border-neutral-200 px-6 py-4 text-center">관리</th>
                </tr>
              </thead>

              <tbody className="mb-x-auto divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user._id} className="group transition-colors hover:bg-neutral-50">
                    <td className="px-6 py-4 font-mono text-xs text-neutral-400">{user._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-800">{user.name}</div>
                      <div className="mt-0.5 text-xs text-neutral-500">
                        {user.email} ({user.username})
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.user_type === 'business' ? (
                        <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                          사업자
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          개인
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">{user.phoneNumber}</td>
                    <td className="px-6 py-4 text-xs tracking-tight text-neutral-600">
                      {new Date(user.createdAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.emailVerified ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-green-500" title="인증 완료"></span>
                      ) : (
                        <span className="inline-flex h-2 w-2 rounded-full bg-neutral-300" title="인증 대기"></span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-transparent group-hover:text-neutral-500">
                      {/* 행 마우스 오버 시 나타나는 수정 버튼 영역 */}
                      <button
                        onClick={() => openEditModal(user)}
                        className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-medium transition hover:bg-neutral-200 hover:text-black"
                      >
                        상세/수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. 상세/수정 모달 (Modal) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-neutral-800">회원 관리 (상세/수정)</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-600">아이디 (ID)</label>
                <input
                  type="text"
                  disabled
                  value={selectedUser.username}
                  className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-600">이메일</label>
                <input
                  type="text"
                  disabled
                  value={selectedUser.email}
                  className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-600">이름</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-600">연락처</label>
                <input
                  type="text"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-600">회원 분류</label>
                <select
                  value={editFormData.user_type}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, user_type: e.target.value as 'personal' | 'business' })
                  }
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="personal">개인 (Personal)</option>
                  <option value="business">사업자 (Business)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 text-sm">
              <button
                onClick={closeEditModal}
                disabled={isSaving}
                className="rounded-md border border-neutral-300 px-4 py-2 font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                닫기
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '변경 내용 저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
