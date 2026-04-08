import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Promotion from '@/db/models/promotion'

// GET: 배너(기획전/이벤트) 목록 조회
export async function GET() {
  try {
    await dbConnect()

    // 최신 등록순으로 배너 조회
    const promotions = await Promotion.find({}).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, promotions })
  } catch (error) {
    console.error('Failed to fetch promotions:', error)
    return NextResponse.json({ success: false, message: '배너 목록을 불러오지 못했습니다.' }, { status: 500 })
  }
}

// POST: 새 배너(기획전/이벤트) 등록
export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()
    const { title, imageUrl } = body

    if (!title || !imageUrl) {
      return NextResponse.json({ success: false, message: '제목과 이미지 URL을 모두 입력해주세요.' }, { status: 400 })
    }

    // 새 프로모션 생성
    const newPromotion = await Promotion.create({
      title,
      imageUrl,
      isActive: true, // 기본값 활성화
    })

    return NextResponse.json({ success: true, promotion: newPromotion }, { status: 201 })
  } catch (error) {
    console.error('Failed to create promotion:', error)
    return NextResponse.json({ success: false, message: '배너를 등록하지 못했습니다.' }, { status: 500 })
  }
}
