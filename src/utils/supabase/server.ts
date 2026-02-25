import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();

    // 자동 로그인 설정 확인 (기본적으로 true라 가정)
    const isAutoLoginStr = cookieStore.get('is_auto_login')?.value;
    const isAutoLogin = isAutoLoginStr !== 'false';

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            const finalOptions = { ...options };

                            // 자동 로그인이 꺼져있고, 해당 쿠키가 Supabase 인증/세션 쿠키인 경우
                            // maxAge와 expires 속성을 제거하여 브라우저 종료 시 지워지는 Session Cookie로 변환합니다.
                            if (!isAutoLogin && (name.startsWith('sb-') || name.includes('-auth-token'))) {
                                delete finalOptions.maxAge;
                                delete finalOptions.expires;
                            }

                            cookieStore.set(name, value, finalOptions);
                        });
                    } catch (error) {
                        // ignore set errors from server components
                    }
                },
            },
        }
    );
}
