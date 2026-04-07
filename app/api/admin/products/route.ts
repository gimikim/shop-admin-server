import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'

export async function GET() {
  try {
    await dbConnect()

    // 최신 등록순으로 정렬하여 모든 상품 가져오기
    // 필요한 경우 populate('sellerId', 'name email') 등을 통해 판매자 정보도 가져올 수 있습니다.
    const products = await Product.find({}).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ success: true, data: products })
  } catch (error: unknown) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, message: '상품 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
