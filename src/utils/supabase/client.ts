import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    console.log("CLIENT ENV CHECK:");
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("URL Length:", process.env.NEXT_PUBLIC_SUPABASE_URL?.length);
    // Create a supabase client on the browser with project's public anon key
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
