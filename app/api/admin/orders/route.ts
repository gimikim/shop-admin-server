import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Order from '@/db/models/order'

export async function GET() {
  try {
    await dbConnect()

    // Fetch all orders, typically sorted by nearest creation time first
    // Optional populate can be added if needed, for instance user details:
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('userId', 'email').lean()

    return NextResponse.json({ success: true, data: orders })
  } catch (error: unknown) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, message: '주문 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
