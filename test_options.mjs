import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ykicqsvhahbpruvojkti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraWNxc3ZoYWhicHJ1dm9qa3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTg4NTMsImV4cCI6MjA4NzE5NDg1M30.guP6-yBaF9mUlL7FxomjQR2go-1TgqM76Hz4QZGcMrg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testOptions() {
    console.log("1. Authenticating...");
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@video-collab.com',
        password: 'AdminPassword123!',
    });
    if (authError) return console.error("Auth Fail", authError);

    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `${user.id}/preflight_test.mp4`;

    console.log("2. Creating URL...");
    const { data } = await supabase.storage.from('videos').createSignedUploadUrl(filePath);
    if (!data) return console.error("No token");

    // Construct the actual URL that the browser calls for uploadToSignedUrl
    // It is a PUT request to:
    // https://ykicqsvhahbpruvojkti.supabase.co/storage/v1/object/upload/sign/videos/[filePath]?token=[token]
    const uploadUrl = `${supabaseUrl}/storage/v1/object/upload/sign/videos/${filePath}?token=${data.token}`;

    console.log("3. Sending OPTIONS Preflight to URL...");
    const res = await fetch(uploadUrl, {
        method: 'OPTIONS',
        headers: {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'PUT',
            'Access-Control-Request-Headers': 'authorization, content-type, x-client-info'
        }
    });

    console.log("Status:", res.status);
    console.log("CORS Header (Allow Origin):", res.headers.get('access-control-allow-origin'));
    console.log("CORS Header (Allow Methods):", res.headers.get('access-control-allow-methods'));

    // Also test a regular PUT with fetch but with an Origin header (simulate browser)
    console.log("4. Sending PUT request with Origin...");
    const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Origin': 'http://localhost:3000',
            'Content-Type': 'video/mp4'
        },
        body: new Uint8Array([0])
    });
    console.log("PUT Status:", putRes.status);
    console.log("PUT CORS Header:", putRes.headers.get('access-control-allow-origin'));
}

testOptions();
