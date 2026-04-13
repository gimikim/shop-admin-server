import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Order from '@/db/models/order'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    const { status } = body

    await dbConnect()

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )

    if (!updatedOrder) {
      return NextResponse.json({ success: false, message: '해당 주문을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (error: unknown) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, message: '주문 정보를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await dbConnect()

    const deletedOrder = await Order.findByIdAndDelete(id)

    if (!deletedOrder) {
      return NextResponse.json({ success: false, message: '해당 주문을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: '주문 내역이 삭제되었습니다.' })
  } catch (error: unknown) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { success: false, message: '주문을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
