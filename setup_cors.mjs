import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

// Node.js 내장 fs 모듈로 .env.local 강제 파싱
const envFile = fs.readFileSync('.env.local', 'utf-8');
envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        process.env[match[1]] = match[2].replace(/^['"](.*)['"]$/, '$1').trim();
    }
});

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = 'videos'; // Assuming the bucket name is 'videos'

if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error('Error: R2 credentials are not set in .env.local');
    process.exit(1);
}

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

async function setCors() {
    const corsRules = {
        CORSRules: [
            {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE'],
                // Vercel app domain and localhost are allowed
                AllowedOrigins: [
                    'http://localhost:3000',
                    'https://' + process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, ''),
                    '*' // Fallback to completely allow all origins to prevent any CORS issues
                ],
                ExposeHeaders: ['ETag'],
                MaxAgeSeconds: 3600,
            },
        ],
    };

    try {
        console.log(`Setting CORS for bucket: ${bucketName}...`);
        const command = new PutBucketCorsCommand({
            Bucket: bucketName,
            CORSConfiguration: corsRules,
        });

        await s3Client.send(command);
        console.log('✅ CORS configuration successfully applied to R2 bucket.');
    } catch (err) {
        console.error('❌ Failed to set CORS:', err);
    }
}

setCors();
