import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Auth successful, redirect to the desired URL
            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error('OAuth Callback Error:', error);
        }
    }

    // return the user to an error page with instructions or back to the login page
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
