import { NextResponse } from 'next/server';
import { validateAdminCredentials } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // 프론트엔드는 loginId로 보내지만, 기존 로직은 email을 기대함
        // 두 필드 모두 지원하도록 변경
        const loginId = body.loginId || body.email;
        const password = body.password;

        if (!loginId || !password) {
            return NextResponse.json(
                { success: false, message: '아이디(또는 이메일)와 비밀번호를 입력해주세요.' },
                { status: 400 }
            );
        }

        console.log(`[Admin Login Attempt] LoginID: ${loginId}`);
        const result = await validateAdminCredentials(loginId, password);
        console.log(`[Admin Login Result] Valid: ${result.valid}, Role: ${result.role}`);

        if (!result.valid) {
            return NextResponse.json(
                { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
                { status: 401 }
            );
        }

        // 세션에 저장할 관리자 정보 (대시보드와 호환되도록 partner 키 사용 및 관련 필드 구성)
        const adminSession = {
            partnerId: result.adminId || "admin",
            name: result.adminName || "관리자",
            email: result.adminId || loginId,
            role: result.role,
            level: 'admin',
            customUrl: 'admin',
            loginAt: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            partner: adminSession,
        });
    } catch (error) {
        console.error('Admin login error:', error);

        if (error instanceof Error && error.message.includes('환경변수')) {
            return NextResponse.json(
                { success: false, message: 'Google Sheets 연결이 설정되지 않았습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, message: '로그인 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
