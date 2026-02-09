import { NextResponse } from 'next/server';
import { validatePartnerCredentials, validateAdminCredentials, getPartnerByLoginId } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { loginId, password } = body;

        if (!loginId) {
            return NextResponse.json(
                { success: false, message: '아이디를 입력해주세요.' },
                { status: 400 }
            );
        }

        // 0. 관리자 프리패스 로그인 (Master Login)
        // body에 masterKey가 있고, 환경변수 ADMIN_SECRET_KEY와 일치하면 비밀번호 검증 없이 로그인 처리
        const { masterKey } = body;
        if (masterKey && masterKey === process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY) {
            console.log(`[Master Login] Attempting login as ${loginId}`);

            // 파트너 정보 조회 (비밀번호 검증 없이)
            const partner = await getPartnerByLoginId(loginId);

            if (partner) {
                const partnerSession = {
                    partnerId: String(partner.partnerId),
                    name: String(partner.companyName),
                    customUrl: String(partner.customUrl),
                    pointInfo: String(partner.pointInfo),
                    level: 'partner',
                    loginId: String(partner.loginId)
                };

                return NextResponse.json({
                    success: true,
                    partner: partnerSession,
                });
            } else {
                return NextResponse.json(
                    { success: false, message: '존재하지 않는 파트너 아이디입니다.' },
                    { status: 404 }
                );
            }
        }

        if (!password) {
            return NextResponse.json(
                { success: false, message: '비밀번호를 입력해주세요.' },
                { status: 400 }
            );
        }

        // 1. 파트너 계정 확인
        console.log(`[Partner Login Attempt] LoginID: ${loginId}`);
        const partner = await validatePartnerCredentials(loginId, password);
        console.log(`[Partner Login Result] Found: ${!!partner}`);

        if (partner) {
            const partnerSession = {
                partnerId: String(partner.partnerId),
                name: String(partner.companyName),
                customUrl: String(partner.customUrl),
                pointInfo: String(partner.pointInfo),
                level: 'partner',
                loginId: String(partner.loginId)
            };

            return NextResponse.json({
                success: true,
                partner: partnerSession,
            });
        }

        // 2. 관리자 계정 확인
        const adminResult = await validateAdminCredentials(loginId, password);

        if (adminResult.valid) {
            const partnerSession = {
                partnerId: String(adminResult.adminId),
                name: String(adminResult.adminName),
                customUrl: 'admin',
                level: 'admin',
            };

            return NextResponse.json({
                success: true,
                partner: partnerSession,
            });
        }

        return NextResponse.json(
            { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Partner login error:', error);

        if (error instanceof Error) {
            // 상세 에러 로깅
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);

            if (error.message.includes('permission') || error.message.includes('403')) {
                return NextResponse.json(
                    { success: false, message: 'Google Sheets 접근 권한이 없습니다. 서비스 계정을 시트에 공유해주세요.' },
                    { status: 500 }
                );
            }

            if (error.message.includes('NOT_FOUND') || error.message.includes('404')) {
                return NextResponse.json(
                    { success: false, message: 'Google Sheets를 찾을 수 없습니다. 시트 ID를 확인해주세요.' },
                    { status: 500 }
                );
            }

            if (error.message.includes('환경변수')) {
                return NextResponse.json(
                    { success: false, message: 'Google Sheets 연결이 설정되지 않았습니다. 관리자에게 문의하세요.' },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { success: false, message: `로그인 처리 중 오류가 발생했습니다: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, message: '로그인 처리 중 알 수 없는 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
