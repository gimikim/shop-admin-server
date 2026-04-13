/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useEffect, useState } from 'react'

interface Promotion {
  _id: string
  title: string
  imageUrl: string
  isActive: boolean
  createdAt: string
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // 모달 제어 및 폼 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>('')
  const [newImageUrl, setNewImageUrl] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  // 수정 관련 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<string>('')
  const [editTitle, setEditTitle] = useState<string>('')
  const [editImageUrl, setEditImageUrl] = useState<string>('')

  // 데이터 로딩
  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/promotions')
      const data = await res.json()
      if (data.success) {
        setPromotions(data.promotions)
      } else {
        alert(data.message || '데이터를 불러오지 못했습니다.')
      }
    } catch (error) {
      console.error(error)
      alert('데이터 로딩 중 에러가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  // 활성화 상태 토글
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setPromotions((prev) =>
          prev.map((promo) => (promo._id === id ? { ...promo, isActive: !promo.isActive } : promo))
        )
      } else {
        alert(data.message || '상태 업데이트 실패')
      }
    } catch (error) {
      console.error(error)
      alert('업데이트 중 오류가 발생했습니다.')
    }
  }

  // 삭제 처리
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 기획전을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setPromotions((prev) => prev.filter((promo) => promo._id !== id))
      } else {
        alert(data.message || '삭제 실패')
      }
    } catch (error) {
      console.error(error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // 수정 버튼 클릭 시 모달 열기
  const handleEditClick = (promo: Promotion) => {
    setEditingId(promo._id)
    setEditTitle(promo.title)
    setEditImageUrl(promo.imageUrl)
    setIsEditModalOpen(true)
  }

  // 수정 처리
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim() || !editImageUrl.trim()) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/promotions/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, imageUrl: editImageUrl }),
      })
      const data = await res.json()

      if (data.success) {
        setPromotions((prev) =>
          prev.map((promo) =>
            promo._id === editingId ? { ...promo, title: editTitle, imageUrl: editImageUrl } : promo
          )
        )
        setIsEditModalOpen(false)
      } else {
        alert(data.message || '수정 실패')
      }
    } catch (error) {
      console.error(error)
      alert('수정 중 에러가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 새 기획전 생성
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newImageUrl.trim()) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, imageUrl: newImageUrl }),
      })
      const data = await res.json()

      if (data.success) {
        setPromotions([data.promotion, ...promotions])
        setNewTitle('')
        setNewImageUrl('')
        setIsModalOpen(false)
      } else {
        alert(data.message || '등록 실패')
      }
    } catch (error) {
      console.error(error)
      alert('등록 중 에러가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">기획전 및 이벤트 배너 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            구매자 서버 메인에 노출되는 기획전 배너들을 관리합니다.
            <br />
            활성화된 배너만 구매자 화면에 보이게 됩니다.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          + 배너 등록
        </button>
      </div>

      {/* 목록 영역 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  배너 이미지
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  관리 제목
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  상태 (On/Off)
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  등록일
                </th>
                <th scope="col" className="px-6 py-4 text-right font-medium">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    등록된 배너가 없습니다.
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo._id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {/* 외부 URL일 수 있으므로 img 태그 사용 */}
                      <img
                        src={promo.imageUrl}
                        alt={promo.title}
                        className="h-16 w-32 rounded border border-gray-200 object-cover shadow-sm"
                        onError={(e) => {
                          // 이미지 로드 실패시 처리
                          ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x64?text=No+Image'
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{promo.title}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(promo._id, promo.isActive)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          promo.isActive ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={promo.isActive}
                      >
                        <span className="sr-only">Toggle Active</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            promo.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {promo.isActive ? '활성 (노출됨)' : '비활성 (숨김)'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{new Date(promo.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditClick(promo)}
                        className="mr-4 text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(promo._id)}
                        className="text-sm font-medium text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 등록 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
            <h3 className="mb-4 text-lg font-bold leading-6 text-gray-900">신규 기획전 배너 등록</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">배너 제목 (관리용)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="추석맞이 특별 할인 기획전"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">배너 이미지 URL</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://example.com/banner.png"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">배너로 사용할 이미지 링크 주소를 입력해주세요.</p>
              </div>

              {/* 이미지 미리보기 */}
              {newImageUrl && (
                <div className="mt-2 flex items-center justify-center overflow-hidden rounded-lg border bg-gray-100 p-2">
                  <img
                    src={newImageUrl}
                    alt="미리보기"
                    className="max-h-32 object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x120?text=Invalid+Image+URL'
                    }}
                  />
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={submitting}
                >
                  {submitting ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
            <h3 className="mb-4 text-lg font-bold leading-6 text-gray-900">기획전 배너 수정</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">배너 제목 (관리용)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="추석맞이 특별 할인 기획전"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">배너 이미지 URL</label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://example.com/banner.png"
                  required
                />
              </div>

              {/* 이미지 미리보기 */}
              {editImageUrl && (
                <div className="mt-2 flex items-center justify-center overflow-hidden rounded-lg border bg-gray-100 p-2">
                  <img
                    src={editImageUrl}
                    alt="미리보기"
                    className="max-h-32 object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x120?text=Invalid+Image+URL'
                    }}
                  />
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={submitting}
                >
                  {submitting ? '수정 중...' : '수정하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
