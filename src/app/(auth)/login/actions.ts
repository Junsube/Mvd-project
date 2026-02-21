'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function loginWithOAuth(provider: 'google') {
    const supabase = await createClient();

    // 사용자가 Vercel 환경 변수에 localhost:3000을 넣어도 실제 접속한 도메인을 따라가도록 동적 계산
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const origin = `${protocol}://${host}`;

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
