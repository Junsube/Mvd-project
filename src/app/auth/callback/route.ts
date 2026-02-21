import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    // Vercel 등 배포 환경에서 origin이 localhost로 찍히는 현상(포워딩/프록시 이슈) 방어
    // 환경변수에 localhost가 적혀있어도 실제 기기에서 접속한 도메인을 따라가도록 동적 처리
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const siteUrl = `${protocol}://${host}`;

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Auth successful, redirect to the desired URL (using environment variable)
            return NextResponse.redirect(`${siteUrl}${next}`);
        } else {
            console.error('OAuth Callback Error:', error);
        }
    }

    // return the user to an error page with instructions or back to the login page
    return NextResponse.redirect(`${siteUrl}/login?error=auth-callback-failed`);
}
