import mongoose, { Schema, Document } from 'mongoose'

// Promotion 문서에 대한 TypeScript 인터페이스
export interface IPromotion extends Document {
  title: string
  imageUrl: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Promotion 스키마 정의 (구매자 서버에 띄울 이벤트/기획전 배너 데이터)
const promotionSchema = new Schema<IPromotion>(
  {
    title: {
      type: String,
      required: [true, '프로모션 제목을 입력해주세요'], // 이벤트 제목 (관리용)
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, '이미지 URL을 입력해주세요'], // 노출할 이미지 주소
    },
    isActive: {
      type: Boolean,
      default: true, // 기본적으로 생성 시 활성화 상태
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
    collection: 'promotions', // MongoDB 내에서 명시적으로 promotions 컬렉션 사용
  }
)

// 이미 모델이 컴파일되어 있다면 그것을 사용하고, 아니면 새로 컴파일함
const Promotion = mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', promotionSchema)

export default Promotion
