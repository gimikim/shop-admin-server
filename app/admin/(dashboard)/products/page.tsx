'use client'

import React, { useEffect, useState } from 'react'

interface Product {
  _id: string
  name: string
  brand: string
  price: number
  discount: number
  stock: number
  category: string
  isAvailable: boolean
  createdAt: string
  images: string[]
}

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // "상세/수정" 모달 관련 상태
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    brand: '',
    price: 0,
    stock: 0,
    category: '',
    isAvailable: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  // 상품 목록 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products')
        const data = await response.json()

        if (data.success) {
          setProducts(data.data)
        } else {
          setError(data.message || '상품 데이터를 불러오지 못했습니다.')
        }
      } catch {
        setError('통신 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // 가격 포맷 헬퍼
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  // 모달 열기
  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setEditFormData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      category: product.category,
      isAvailable: product.isAvailable,
    })
  }

  // 모달 닫기
  const closeEditModal = () => {
    setSelectedProduct(null)
  }

  // 삭제 처리
  const handleDelete = async (productId: string) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        alert('상품이 성공적으로 삭제되었습니다.')
        setProducts(products.filter((p) => p._id !== productId))
      } else {
        alert(data.message || '상품 삭제에 실패했습니다.')
      }
    } catch {
      alert('서버와의 통신 오류가 발생했습니다.')
    }
  }

  // 수정 사항 저장
  const handleSaveChanges = async () => {
    if (!selectedProduct) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })
      const data = await res.json()

      if (data.success) {
        alert('상품 정보가 성공적으로 수정되었습니다.')
        setProducts(products.map((p) => (p._id === selectedProduct._id ? ({ ...p, ...editFormData } as Product) : p)))
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
      {/* 2. 상단 헤더 */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">상품 관리 (Products)</h1>
          <p className="mt-1 text-sm text-neutral-500">사용자 앱에 등록된 모든 상품 정보를 조회하고 관리합니다.</p>
        </div>
      </div>

      {/* 3. 데이터 테이블 영역 */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white text-sm shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium tracking-wide text-neutral-600">
              총 <span className="font-bold text-blue-600">{products.length}</span>개 상품
            </span>
          </div>
          <div className="w-64">
            <input
              type="text"
              placeholder="상품명 또는 카테고리 검색..."
              className="w-full rounded-md border border-neutral-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 4. 상태 표시에 따른 분기 처리 */}
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500">데이터를 불러오는 중입니다...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">등록된 상품이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max flex-col whitespace-nowrap text-left">
              <thead className="bg-neutral-50 font-medium text-neutral-500">
                <tr>
                  <th className="border-y border-neutral-200 px-6 py-4">상품 (ID / 정보)</th>
                  <th className="border-y border-neutral-200 px-6 py-4">카테고리 & 브랜드</th>
                  <th className="border-y border-neutral-200 px-6 py-4 text-right">판매가</th>
                  <th className="border-y border-neutral-200 px-6 py-4 text-right">재고수량</th>
                  <th className="border-y border-neutral-200 px-6 py-4 text-center">판매상태</th>
                  <th className="border-y border-neutral-200 px-6 py-4 text-center">관리</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {products.map((product) => (
                  <tr key={product._id} className="group transition-colors hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-neutral-200">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-neutral-400">No Img</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-800">{product.name}</div>
                          <div className="mt-0.5 font-mono text-xs text-neutral-400">
                            ID: {product._id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-800">{product.category}</div>
                      <div className="text-xs text-neutral-500">{product.brand}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-neutral-800">
                      {formatPrice(product.price)}원
                      {product.discount > 0 && (
                        <span className="ml-2 block text-xs text-red-500">({product.discount}% 할인)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.stock > 0 ? 'bg-neutral-100 text-neutral-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {product.stock}개
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'}`}
                      >
                        {product.isAvailable ? '판매중' : '판매중지'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center group-hover:text-neutral-500">
                      <div className="flex items-center justify-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-medium transition hover:bg-neutral-200 hover:text-black"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. 상세/수정 모달 */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-neutral-800">상품 수정 - {selectedProduct.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-600">상품명</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-600">카테고리</label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-600">브랜드</label>
                  <input
                    type="text"
                    value={editFormData.brand}
                    onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-600">판매가(원)</label>
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-600">재고 수량(개)</label>
                  <input
                    type="number"
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 flex items-center space-x-2 text-sm font-medium text-neutral-600">
                  <input
                    type="checkbox"
                    checked={editFormData.isAvailable}
                    onChange={(e) => setEditFormData({ ...editFormData, isAvailable: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>현재 판매 가능 상태 (사이트 노출)</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 text-sm">
              <button
                onClick={closeEditModal}
                disabled={isSaving}
                className="rounded-md border border-neutral-300 px-4 py-2 font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
