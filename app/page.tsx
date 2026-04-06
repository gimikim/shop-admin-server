import { redirect } from 'next/navigation'

// 일반 사용자의 쇼핑몰 화면을 완전히 지우고,
// 관리자 서버의 루트 페이지에 접근 시 항상 관리자 로그인 또는 메인 페이지로 곧바로 이동시킵니다.
export default function AdminRootPage() {
  // 사용자가 관리자 메인(localhost:3001/)으로 접속하면 
  // 즉시 관리자 로그인 페이지로 주소를 바꿔버립니다.
  redirect('/admin/login')

  return null
}
