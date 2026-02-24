'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const commentSchema = z.object({
    videoId: z.string().uuid(),
    content: z.string().min(1, '댓글을 입력해주세요.').max(1000, '댓글이 너무 깁니다.'),
    timestampSec: z.number().nullable(),
});

export async function addComment(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const { data: userAuth, error: authError } = await supabase.auth.getUser();
    if (authError || !userAuth.user) {
        return { error: '로그인이 필요합니다.' };
    }

    const videoId = formData.get('videoId') as string;
    const content = formData.get('content') as string;
    const timestampStr = formData.get('timestampSec') as string;
    const timestampSec = timestampStr ? parseFloat(timestampStr) : null;

    const parsed = commentSchema.safeParse({
        videoId,
        content,
        timestampSec,
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { error: dbError } = await supabase.from('comments').insert([{
        video_id: parsed.data.videoId,
        user_id: userAuth.user.id,
        content: parsed.data.content,
        timestamp_sec: parsed.data.timestampSec,
    }]);

    if (dbError) {
        console.error('댓글 DB 삽입 오류:', dbError.message);
        return { error: '댓글을 저장하는 데 실패했습니다.' };
    }

    revalidatePath(`/dashboard/videos/${videoId}`);
    return { success: true };
}

export async function getVideoDetails(videoId: string) {
    const supabase = await createClient();

    const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

    if (videoError || !video) {
        return { error: '비디오를 찾을 수 없습니다.' };
    }

    const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

    return {
        data: {
            video,
            youtubeId: video.file_path,
            comments: commentsError ? [] : comments,
        }
    };
}
