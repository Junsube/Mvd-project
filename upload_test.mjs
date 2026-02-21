import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLocal = fs.readFileSync('.env.local', 'utf8').replace(/\r/g, '');
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function doUpload() {
    console.log("1. Authenticating admin...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@video-collab.com',
        password: 'AdminPassword123!',
    });

    if (authError) {
        console.error("Auth Error:", authError.message);
        return;
    }
    console.log("Logged in UID:", authData.user.id);

    console.log("2. Uploading tiny file...");
    const filePath = `${authData.user.id}/test_upload_${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, 'Hello world text file content', {
            contentType: 'text/plain',
        });

    if (uploadError) {
        console.error("Upload Error:", uploadError.message, uploadError);
    } else {
        console.log("Upload Success!", uploadData);
    }
}

doUpload();
