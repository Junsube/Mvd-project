import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    // Vercel 등 배포 환경에서 origin이 localhost로 찍히는 현상(포워딩/프록시 이슈) 방어
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin;

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
