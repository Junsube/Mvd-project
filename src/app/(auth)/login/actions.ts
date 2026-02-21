'use server';

import { createClient } from '@/utils/supabase/server';
import { loginSchema, signupSchema } from '@/utils/validation';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';



export async function loginWithOAuth(provider: 'google') {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    });

    if (data.url) {
        redirect(data.url);
    }

    if (error) {
        console.error('OAuth 로그인 에러:', error);
    }
}
