'use client'

import React, { useEffect, useState } from 'react'

interface OrderItem {
  productId: number
  name: string
  brand: string
  price: number
  discount: number
  finalPrice: number
  quantity: number
  image: string
}

interface Order {
  _id: string
  orderNumber: string
  userId: { _id: string; email: string } | string
  items: OrderItem[]
  totalAmount: number
  status: string
  shippingAddress: string
  recipientName: string
  recipientPhone: string
  createdAt: string
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders')
        const data = await response.json()

        if (data.success) {
          setOrders(data.data)
        } else {
          setError(data.message || '주문 데이터를 불러오지 못했습니다.')
        }
      } catch {
        setError('통신 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order)
    setEditStatus(order.status)
  }

  const closeOrderModal = () => {
    setSelectedOrder(null)
  }

  const handleSaveChanges = async () => {
    if (!selectedOrder) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus }),
      })
      const data = await res.json()

      if (data.success) {
        alert('주문 상태가 성공적으로 수정되었습니다.')
        setOrders(orders.map((o) => (o._id === selectedOrder._id ? ({ ...o, status: editStatus } as Order) : o)))
        closeOrderModal()
      } else {
        alert(data.message || '수정에 실패했습니다.')
      }
    } catch {
      alert('서버와의 통신 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case '결제완료':
        return 'bg-blue-100 text-blue-800'
      case '상품준비중':
        return 'bg-yellow-100 text-yellow-800'
      case '배송중':
        return 'bg-indigo-100 text-indigo-800'
      case '배송완료':
        return 'bg-green-100 text-green-800'
      case '주문취소':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-neutral-200 text-neutral-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">주문 관리 (Orders)</h1>
          <p className="mt-1 text-sm text-neutral-500">사용자의 모든 주문 내역을 확인하고 상태를 변경할 수 있습니다.</p>
        </div>
      </div>

      {/* 2. Table Area */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white text-sm shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium tracking-wide text-neutral-600">
              총 <span className="font-bold text-blue-600">{orders.length}</span>건 주문
            </span>
          </div>
          <div className="w-64">
            <input
              type="text"
              placeholder="주문번호, 수령인 검색..."
              className="w-full rounded-md border border-neutral-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 3. Orders Data */}
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500">데이터를 불러오는 중입니다...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">등록된 주문이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max flex-col whitespace-nowrap text-left">
              <thead className="bg-neutral-50 font-medium text-neutral-500">
                <tr>
                  <th className="border-y border-neutral-200 px-6 py-4">주문번호 & 날짜</th>
                  <th className="border-y border-neutral-200 px-6 py-4">수령인 (고객명)</th>
                  <th className="border-y border-neutral-200 px-6 py-4">주문 요약</th>
                  <th className="border-y border-neutral-200 px-6 py-4 text-right">총 결제금액</th>
                  <th className="border-y border-neutral-200 px-6 py-4 text-center">주문 상태</th>
                  <th className="border-y border-neutral-200 px-6 py-4 text-center">관리</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {orders
                  .filter(
                    (o) =>
                      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      o.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((order) => {
                    const orderDateStr = new Date(order.createdAt).toLocaleString('ko-KR')
                    const userEmail = typeof order.userId === 'object' ? order.userId?.email : 'N/A'

                    return (
                      <tr key={order._id} className="group transition-colors hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-neutral-800">{order.orderNumber}</div>
                          <div className="mt-0.5 text-xs text-neutral-400">{orderDateStr}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-neutral-800">{order.recipientName}</div>
                          <div className="text-xs text-neutral-500">{userEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-neutral-800">
                            {order.items.length > 0
                              ? `${order.items[0].name} ${order.items.length > 1 ? `외 ${order.items.length - 1}건` : ''}`
                              : '상품 없음'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-neutral-800">
                          {formatPrice(order.totalAmount)}원
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center group-hover:text-neutral-500">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-medium transition hover:bg-neutral-200 hover:text-black"
                          >
                            상세 / 상태변경
                          </button>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Detail / Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold text-neutral-800">주문 상세 내역</h2>
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs font-medium text-neutral-500 mb-1">주문 번호</span>
                    <span className="font-semibold">{selectedOrder.orderNumber}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-neutral-500 mb-1">주문 일시</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-neutral-500 mb-1">수령인</span>
                    <span>{selectedOrder.recipientName} ({selectedOrder.recipientPhone})</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-neutral-500 mb-1">배송지</span>
                    <span>{selectedOrder.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* 주문 상품 리스트 */}
              <div>
                <h3 className="mb-2 text-sm font-bold text-neutral-700">주문 상품 목록</h3>
                <div className="border rounded-lg border-neutral-200 divide-y divide-neutral-100 text-sm">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded bg-neutral-200 shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full items-center justify-center text-xs text-neutral-400">Img</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-800">{item.name}</div>
                          <div className="text-xs text-neutral-500">{item.brand}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(item.finalPrice)}원</div>
                        <div className="text-xs text-neutral-500">{item.quantity}개</div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-neutral-50 p-3 text-right">
                    <span className="mr-4 text-sm font-medium text-neutral-600">총 결제금액:</span>
                    <span className="text-lg font-bold text-neutral-900">{formatPrice(selectedOrder.totalAmount)}원</span>
                  </div>
                </div>
              </div>

              {/* 상태 변경 폼 */}
              <div>
                <label className="mb-2 block text-sm font-bold text-neutral-700">주문 상태 관리</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="결제완료">결제완료 (Payment Completed)</option>
                  <option value="상품준비중">상품준비중 (Preparing)</option>
                  <option value="배송중">배송중 (Shipping)</option>
                  <option value="배송완료">배송완료 (Delivered)</option>
                  <option value="주문취소">주문취소 (Cancelled)</option>
                </select>
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-2 text-sm">
              <button
                onClick={closeOrderModal}
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
                {isSaving ? '상태 저장 중...' : '상태 변경 적용'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
