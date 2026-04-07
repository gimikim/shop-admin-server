import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'

// 개별 상품 정보 수정
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const productId = params.id
    if (!productId) {
      return NextResponse.json({ success: false, message: '상품 ID가 제공되지 않았습니다.' }, { status: 400 })
    }

    const body = await request.json()

    // 상품 정보 업데이트 (isAvailable, price, stock 등 수정 가능한 항목)
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!updatedProduct) {
      return NextResponse.json({ success: false, message: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedProduct, message: '상품이 성공적으로 업데이트되었습니다.' })
  } catch (error: unknown) {
    console.error('Error updating product:', error)
    return NextResponse.json({ success: false, message: '상품 정보 업데이트 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 개별 상품 삭제 기능 (필요한 경우)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const productId = params.id
    const deletedProduct = await Product.findByIdAndDelete(productId)

    if (!deletedProduct) {
      return NextResponse.json({ success: false, message: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: '상품이 성공적으로 삭제되었습니다.' })
  } catch (error: unknown) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ success: false, message: '상품 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
