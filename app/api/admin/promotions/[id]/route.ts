import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Promotion from '@/db/models/promotion'

interface RouteParams {
  params: {
    id: string
  }
}

// PATCH: 특정 배너의 정보를 업데이트 (주로 on/off 상태 변경)
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await dbConnect()
    const { id } = params
    
    // 요청 본문에서 업데이트할 필드들을 가져옴
    const body = await req.json()

    // 배너 정보 업데이트
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!updatedPromotion) {
      return NextResponse.json({ success: false, message: '해당 배너를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, promotion: updatedPromotion })
  } catch (error) {
    console.error('Failed to update promotion:', error)
    return NextResponse.json({ success: false, message: '배너 상태를 업데이트하지 못했습니다.' }, { status: 500 })
  }
}

// DELETE: 특정 배너 삭제
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await dbConnect()
    const { id } = params

    const deletedPromotion = await Promotion.findByIdAndDelete(id)

    if (!deletedPromotion) {
      return NextResponse.json({ success: false, message: '해당 배너를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: '배너가 삭제되었습니다.' })
  } catch (error) {
    console.error('Failed to delete promotion:', error)
    return NextResponse.json({ success: false, message: '배너를 삭제하지 못했습니다.' }, { status: 500 })
  }
}
