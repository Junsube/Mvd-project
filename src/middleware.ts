import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    if (process.env.NODE_ENV === 'development') {
        console.log("[Middleware] Incoming Request:", request.nextUrl.pathname);
    }
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

    // 보안 검사(리다이렉트)가 필요한 경로일 때만 무거운 getUser API를 호출하도록 최적화합니다.
    if (isAuthRoute || isProtectedRoute) {
        // 프리패치(Prefetch) 요청인 경우 가벼운 getSession으로 우회할 수도 있으나, 완벽한 보안을 위해 getUser를 유지하되 범위를 축소합니다.
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (isProtectedRoute && !user) {
            // AuthZ failure: Redirect non-authenticated users trying to access dashboard
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (isAuthRoute && user) {
            // Redirect authenticated users away from the login page to the dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Set tight CORS restrictions to mitigate CSRF to allowed origins
    const origin = request.headers.get('origin');
    if (origin && origin !== process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === 'production') {
        supabaseResponse.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*');
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
