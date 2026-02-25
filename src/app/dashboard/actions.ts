'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { videoUploadSchema } from '@/utils/validation';

export async function addVideoMetadata(data: {
    title: string;
    description: string;
    youtube_id: string;
}) {
    const supabase = await createClient();

    const validation = videoUploadSchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.issues[0].message };
    }

    const { data: userAuth, error: authError } = await supabase.auth.getUser();

    if (authError || !userAuth.user) {
        return { error: '로그인이 필요합니다.' };
    }

    const { error: dbError } = await supabase.from('videos').insert([
        {
            user_id: userAuth.user.id,
            title: data.title,
            description: data.description,
            file_path: data.youtube_id, // 유튜브 ID를 file_path 컬럼에 저장
            file_size: 0,
            content_type: 'youtube/video',
        },
    ]);

    if (dbError) {
        console.error('메타데이터 DB 삽입 오류:', dbError.message);
        return { error: '비디오 정보를 저장하는 데 실패했습니다.' };
    }

    revalidatePath('/dashboard');
    return { success: true };
}


export async function deleteVideo(videoId: string) {
    const supabase = await createClient();
    const { data: userAuth, error: authError } = await supabase.auth.getUser();

    if (authError || !userAuth.user) {
        return { error: '로그인이 필요합니다.' };
    }

    // 1. 소유권 검증
    const { data: video, error: fetchError } = await supabase
        .from('videos')
        .select('user_id')
        .eq('id', videoId)
        .single();

    if (fetchError || !video) {
        return { error: '비디오를 찾을 수 없거나 이미 삭제되었습니다.' };
    }

    if (video.user_id !== userAuth.user.id) {
        return { error: '해당 비디오를 삭제할 권한(소유권)이 없습니다.' };
    }

    // 유튜브 모드이므로 외부 스토리지(R2) 파일 삭제 과정 불필요

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
