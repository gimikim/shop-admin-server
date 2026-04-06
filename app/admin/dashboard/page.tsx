// 일반 쇼핑몰 페이지와 구분되는 관리자용 내부 시스템 메인 화면입니다.
export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
          Administrator Dashboard
        </h1>
        <p className="text-neutral-400 text-lg">
          환영합니다! 최고 관리자님. 시스템에 성공적으로 로그인하셨습니다.
        </p>
        
        <div className="mt-10 p-8 border border-neutral-700 bg-neutral-800 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">현황 요약 (준비 중)</h2>
          <p className="text-neutral-300">
            이곳에 앞으로 사이트 운영에 필요한 회원 관리, 상품 등록, 주문 내역 통계 등의 기능을 채워넣을 예정입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
