import mongoose from 'mongoose'

// 관리자(Admin) 로그인 및 계정 관리를 위한 데이터베이스 모델 스키마입니다.
// 일반 사용자 스키마(User)와 완전히 분리되어 관리자 전용 권한을 다룹니다.
const AdminSchema = new mongoose.Schema(
  {
    // 관리자 로그인에 사용할 아이디입니다.
    // 일반 사용자와 겹치지 않게 별도의 컬렉션에서 고유값(unique)으로 관리합니다.
    username: { type: String, required: true, trim: true, unique: true },

    // 암호화(해싱) 처리된 관리자 비밀번호입니다.
    // 보안을 위해 원래의 평문 비밀번호는 저장하지 않습니다.
    passwordHash: { type: String, required: true },

    // 관리자 이름 또는 별칭 (예: '최고 관리자', '시스템 어드민')
    name: { type: String, required: true, trim: true },

    // 관리자의 역할 및 권한 등급을 지정합니다.
    // 추후 필요 시 'superadmin', 'manager' 등으로 세분화할 수 있습니다.
    role: { type: String, default: 'admin' },

    // 관리자 계정이 생성된 시각입니다.
    createdAt: { type: Date, default: Date.now },

    // 계정 정보가 마지막으로 수정(업데이트)된 시각입니다.
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // createdAt, updatedAt을 자동으로 관리하도록 설정합니다.
    collection: 'admin', // MongoDB에서 'admin'이라는 컬렉션 이름으로 저장합니다.
  }
)

// 로그인 시 빠른 조회를 위해 username 필드에 고유(unique) 인덱스를 생성합니다.
AdminSchema.index({ username: 1 }, { unique: true })

// 기존에 생성된 모델이 있으면 재사용하고, 없으면 새로 Admin 모델을 생성합니다.
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)

export default Admin
