import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/db/dbConnect'
import Admin from '@/db/models/admin'

/**
 * 로그인 시 입력받은 비밀번호를 DB 저장 시와 동일하게
 * PBKDF2 암호화 방식으로 변환하여 해시값을 반환합니다.
 */
function hashPassword(password: string) {
  // 관리자 비밀번호도 회원가입과 동일한 솔트를 사용하는 것으로 구현합니다.
  return crypto.pbkdf2Sync(password, 'signup-salt', 1000, 64, 'sha512').toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    // 1. 필수 입력값 검사 (아이디, 비밀번호)
    if (!username || !password) {
      return NextResponse.json({ message: '아이디와 비밀번호를 모두 입력해 주세요.' }, { status: 400 })
    }

    // 2. DB 연결
    await dbConnect()

    // [개발용 로직] 첫 로그인 시동 시 admin 계정이 아예 없으면 기본 관리자 계정을 하나 추가해줍니다.
    // 실서비스에서는 이 코드를 지우고 안전한 방식으로 관리자를 생성해야 합니다.
    const adminCount = await Admin.countDocuments()
    if (adminCount === 0 && username === 'admin') {
      const defaultPasswordHash = hashPassword('admin')
      await Admin.create({
        username: 'admin',
        passwordHash: defaultPasswordHash,
        name: '최고 관리자',
        role: 'superadmin',
      })
      console.log('초기 시스템: 최고 관리자(admin/admin) 계정이 자동 생성되었습니다.')
    }

    // 3. 관리자 컬렉션에서 아이디로 사용자 검색
    const adminUser = await Admin.findOne({ username })

    // 등록된 관리자가 없는 경우 예외 처리
    if (!adminUser) {
      return NextResponse.json({ message: '등록되지 않은 관리자 아이디입니다.' }, { status: 404 })
    }

    // 4. 비밀번호 일치 여부 확인
    const hashedInputPassword = hashPassword(password)
    if (adminUser.passwordHash !== hashedInputPassword) {
      return NextResponse.json({ message: '비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }

    // 5. 로그인 성공 시 JWT 발급 (일반 사용자와 구분되도록 세팅)
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    
    // 관리자 전용 토큰 내용 (userId, role 포함)
    const token = jwt.sign(
      { 
        userId: adminUser._id, 
        username: adminUser.username, 
        role: adminUser.role 
      }, 
      jwtSecret, 
      { expiresIn: '1d' } // 관리자는 일반 유저보다 잦은 갱신을 위해 1일 만료 유지
    )

    const response = NextResponse.json({
      message: '관리자 로그인에 성공했습니다.',
      admin: {
        name: adminUser.name,
        username: adminUser.username,
        role: adminUser.role,
      },
    })

    // 6. 관리자 쿠키 발급 (admin_token 이라는 별도 이름으로 구분)
    // 브라우저에 쿠키로 저장하되 보안(httpOnly) 설정을 활성화합니다.
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // 전체 사이트에서 쿠키 유효
      maxAge: 1 * 24 * 60 * 60, // 1일(초 단위)
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ message: '관리자 로그인 처리 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
