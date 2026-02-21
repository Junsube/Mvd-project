'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addVideoMetadata(data: {
    title: string;
    description: string;
    file_path: string;
    file_size: number;
    content_type: string;
}) {
    const supabase = await createClient();

    const { data: userAuth, error: authError } = await supabase.auth.getUser();

    if (authError || !userAuth.user) {
        return { error: '로그인이 필요합니다.' };
    }

    const { error: dbError } = await supabase.from('videos').insert([
        {
            user_id: userAuth.user.id,
            title: data.title,
            description: data.description,
            file_path: data.file_path,
            file_size: data.file_size,
            content_type: data.content_type,
        },
    ]);

    if (dbError) {
        console.error('메타데이터 DB 삽입 오류:', dbError.message);
        return { error: '비디오 정보를 저장하는 데 실패했습니다.' };
    }

    revalidatePath('/dashboard');
    return { success: true };
}

export async function createUploadUrl(fileName: string, fileType: string) {
    const supabase = await createClient();

    const { data: userAuth, error: authError } = await supabase.auth.getUser();

    if (authError || !userAuth.user) {
        return { error: '세션 정보가 없습니다. 다시 로그인해주세요.' };
    }

    // --- [NEW] 9GB Hard Limit 방어 로직 ---
    const { data: allVideos, error: sizeError } = await supabase
        .from('videos')
        .select('file_size');

    if (sizeError) {
        return { error: '용량 검증 중 오류가 발생했습니다.' };
    }

    const totalBytes = allVideos.reduce((acc, v) => acc + (Number(v.file_size) || 0), 0);
    const LIMIT_9GB = 9 * 1024 * 1024 * 1024;

    if (totalBytes > LIMIT_9GB) {
        return { error: '❌ 무료 저장 공간(9GB)을 모두 사용했습니다. 새 영상을 올리려면 기존 영상을 지워주세요.' };
    }
    // ----------------------------------------

    const filePath = `${userAuth.user.id}/${fileName}`;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!bucketName) {
        return { error: '서버 환경 변수(R2_BUCKET_NAME)가 설정되지 않았습니다.' };
    }

    try {
        const { PutObjectCommand } = await import('@aws-sdk/client-s3');
        const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
        const { r2Client } = await import('@/utils/r2/server');

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: filePath,
            ContentType: fileType,
        });

        const fullUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return { data: { filePath, fullUrl } };
    } catch (err: any) {
        console.error('R2 URL 생성 에러:', err);
        return { error: '파일 업로드 준비 중 오류가 발생했습니다.' };
    }
}

export async function deleteVideo(videoId: string) {
    const supabase = await createClient();
    const { data: userAuth, error: authError } = await supabase.auth.getUser();

    if (authError || !userAuth.user) {
        return { error: '로그인이 필요합니다.' };
    }

    // 1. 소유권 검증 및 파일 경로 확보
    const { data: video, error: fetchError } = await supabase
        .from('videos')
        .select('file_path, user_id')
        .eq('id', videoId)
        .single();

    if (fetchError || !video) {
        return { error: '비디오를 찾을 수 없거나 이미 삭제되었습니다.' };
    }

    if (video.user_id !== userAuth.user.id) {
        return { error: '해당 비디오를 삭제할 권한(소유권)이 없습니다.' };
    }

    // 2. Cloudflare R2에서 원본 파일 완전 삭제 (용량 회수)
    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
        return { error: '서버 환경 변수(R2_BUCKET_NAME)가 설정되지 않았습니다.' };
    }

    try {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        const { r2Client } = await import('@/utils/r2/server');

        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: video.file_path,
        });

        await r2Client.send(command);
    } catch (err: any) {
        console.error('R2 파일 삭제 에러:', err);
        return { error: '외부 스토리지에서 영상 파일을 지우는 중 오류가 발생했습니다.' };
    }

    // 3. Supabase 데이터베이스 영상 정보 삭제
    const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

    if (dbError) {
        console.error('DB 영상 삭제 오류:', dbError);
        return { error: '데이터베이스에서 정보를 지우지 못했습니다.' };
    }

    revalidatePath('/dashboard');
    return { success: true };
}

export async function updateVideoVisibility(videoId: string, visibility: 'public' | 'restricted') {
    const supabase = await createClient();
    const { data: userAuth, error: authError } = await supabase.auth.getUser();

    if (authError || !userAuth.user) {
        return { error: '로그인이 필요합니다.' };
    }

    // 1. 소유권 검증 (해당 비디오의 작성자만 권한을 변경할 수 있음)
    const { data: video, error: fetchError } = await supabase
        .from('videos')
        .select('user_id')
        .eq('id', videoId)
        .single();

    if (fetchError || !video) {
        return { error: '비디오 정보를 찾을 수 없습니다.' };
    }

    if (video.user_id !== userAuth.user.id) {
        return { error: '권한 설정을 변경할 수 없는 영상입니다.' };
    }

    // 2. 권한(visibility) 업데이트 
    const { error: updateError } = await supabase
        .from('videos')
        .update({ visibility })
        .eq('id', videoId);

    if (updateError) {
        console.error('권한 변경 로직 에러:', updateError);
        return { error: '상태를 변경하지 못했습니다.' };
    }

    revalidatePath('/dashboard');
    return { success: true };
}
