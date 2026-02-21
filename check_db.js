const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function checkState() {
    // 1. Check if videos table exists by doing a select
    const { data: tableData, error: tableError } = await supabase.from('videos').select('*').limit(1);

    if (tableError) {
        console.log("Videos table check error:", tableError.message, tableError.code);
    } else {
        console.log("Videos table exists! Rows:", tableData.length);
    }

    // 2. Check if storage bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.log("Bucket check error:", bucketError.message);
    } else {
        const hasVideosBucket = buckets.some(b => b.name === 'videos');
        console.log("Bucket 'videos' exists?", hasVideosBucket);
    }
}

checkState();
