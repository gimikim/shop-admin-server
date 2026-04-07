import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

/**
 * [PUT] /api/admin/users/[id]
 * 지정된 회원(id)의 일부 상세 정보를 업데이트합니다.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ success: false, message: '유효한 아이디가 제공되지 않았습니다.' }, { status: 400 })
    }

    await dbConnect()
    const body = await req.json()

    // 프론트에서 넘어온 수정 가능 항목들 (이름, 전화번호, 회원 분류)
    const { name, phoneNumber, user_type } = body

    // 몽구스 쿼리로 해당 id의 문서를 찾아 내용을 업데이트합니다.
    // { new: true } 설정은 업데이트 완료 후의 문서를 반환하라는 의미입니다.
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          phoneNumber,
          user_type,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).select('-passwordHash')

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: '해당 사용자 문서를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('관리자 - 유저 상세 수정 오류:', error)
    return NextResponse.json(
      { success: false, message: '유저 데이터를 수정하는 중 서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
