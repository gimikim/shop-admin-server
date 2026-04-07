import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

/**
 * [GET] /api/admin/users
 * 전체 사용자 데이터를 조회하여 관리자 페이지(표) 구성에 필요한 데이터를 반환합니다.
 */
export async function GET() {
  try {
    // 1. 데이터베이스 연결 확인
    await dbConnect()

    // 2. 관리자 페이지에서 렌더링하기 위해 가장 최근 가입자가 먼저 오도록(createdAt 내림차순) 조회
    // 💡 보안상 비밀번호해시(passwordHash)와 같이 클라이언트에 노출할 필요 없는 컬럼은 제외('-passwordHash')합니다.
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 }).lean() // 순수 JS 객체로 변환하여 성능 최적화 및 직렬화 오류 방지

    // 3. 성공 응답으로 사용자 목록 JSON 반환
    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('관리자 - 유저 목록 조회 오류:', error)
    return NextResponse.json({ success: false, message: '사용자 데이터를 불러오는 데 실패했습니다.' }, { status: 500 })
  }
}
