import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

// 대시보드 홈 화면 (기본 통계 요약 제공)
export default async function AdminDashboardPage() {
  await dbConnect()

  // 최근 가입한 유저 정보 5개를 역순(최신순)으로 가져옵니다.
  const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5).lean()
  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-800">대시보드 요약 (Dashboard Overview)</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
          데이터 새로고침
        </button>
      </div>

      {/* 1. 통계 카드(Stat Cards) 영역 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 카드 1: 총 매출 */}
        <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <span className="mb-1 text-sm font-medium text-neutral-500">총 매출 (Total Sales)</span>
          <span className="text-2xl font-bold text-neutral-800">₩12,450,000</span>
          <span className="mt-2 text-xs font-medium text-green-500">↑ 12% 이번 달</span>
        </div>

        {/* 카드 2: 신규 가입자 */}
        <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <span className="mb-1 text-sm font-medium text-neutral-500">신규 가입자 (New Users)</span>
          <span className="text-2xl font-bold text-neutral-800">342 명</span>
          <span className="mt-2 text-xs font-medium text-green-500">↑ 5% 이번 주</span>
        </div>

        {/* 카드 3: 신규 주문 건수 */}
        <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <span className="mb-1 text-sm font-medium text-neutral-500">신규 주문 (New Orders)</span>
          <span className="text-2xl font-bold text-neutral-800">128 건</span>
          <span className="mt-2 text-xs font-medium text-red-500">↓ 2% 이번 주</span>
        </div>

        {/* 카드 4: 등록된 상품 수 */}
        <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <span className="mb-1 text-sm font-medium text-neutral-500">전체 상품 (Total Products)</span>
          <span className="text-2xl font-bold text-neutral-800">1,245 개</span>
          <span className="mt-2 text-xs font-medium text-neutral-400">변동 없음</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 2. 메인 차트 영역 (좌측/중앙 넓게) */}
        <div className="flex h-96 flex-col rounded-xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">주간 매출 추이</h2>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
            {/* 차트 라이브러리(recharts, chart.js 등)가 들어갈 자리 */}
            <span className="text-sm text-neutral-400">📊 그래프/차트 렌더링 영역</span>
          </div>
        </div>

        {/* 3. 최근 활동 내역 영역 (우측 좁게) */}
        <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">최근 가입 내역</h2>
          <div className="flex-1 overflow-y-auto pr-2">
            <ul className="space-y-4">
              {/* DB 기반 최신 가입 5명 랜더링 */}
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => {
                  const dateStr = new Date(user.createdAt).toLocaleDateString('ko-KR')
                  return (
                    <li
                      key={user._id.toString()}
                      className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{user.email}</p>
                        <p className="text-xs text-neutral-500">{dateStr} 가입</p>
                      </div>
                      {user.user_type === 'business' ? (
                        <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600">
                          사업자
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                          일반
                        </span>
                      )}
                    </li>
                  )
                })
              ) : (
                <div className="py-4 text-center text-sm text-neutral-400">최근 가입 내역이 없습니다.</div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
