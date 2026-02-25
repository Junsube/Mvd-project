'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';

export async function loginWithOAuth(provider: 'google', autoLogin: boolean = true) {
    const supabase = await createClient();

    // 사용자가 Vercel 환경 변수에 localhost:3000을 넣어도 실제 접속한 도메인을 따라가도록 동적 계산
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const origin = `${protocol}://${host}`;

    // 자동 로그인 상태 정보를 임시 쿠키에 저장 (auth/callback 등에서 접근 가능하도록)
    const cookieStore = await cookies();
    cookieStore.set('is_auto_login', autoLogin ? 'true' : 'false', {
        path: '/',
        maxAge: 60 * 5, // 5분 유지 (OAuth 진행 시간 대기)
        httpOnly: true,
        sameSite: 'lax',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (data.url) {
        redirect(data.url);
    }

    if (error) {
        console.error('OAuth 로그인 에러:', error);
    }
}
