'use server';

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const guestCommentSchema = z.object({
    videoId: z.string().uuid(),
    content: z.string().min(1, '댓글을 입력해주세요.').max(1000, '댓글이 너무 깁니다.'),
    timestampSec: z.number().nullable(),
    guestName: z.string().min(1, '이름을 입력해주세요.').max(50, '이름이 너무 깁니다.').optional().nullable(),
});

export async function addGuestComment(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const videoId = formData.get('videoId') as string;
    const content = formData.get('content') as string;
    const timestampStr = formData.get('timestampSec') as string;
    const timestampSec = timestampStr ? parseFloat(timestampStr) : null;
    const guestName = formData.get('guestName') as string | null;

    // Check if the user is authenticated (owner or logged-in user)
    const { data: userAuth } = await supabase.auth.getUser();
    const userId = userAuth?.user?.id || null;

    // If not authenticated, require a guest name
    if (!userId && (!guestName || guestName.trim() === '')) {
        return { error: '비회원은 이름을 입력해야 댓글을 남길 수 있습니다.' };
    }

    const parsed = guestCommentSchema.safeParse({
        videoId,
        content,
        timestampSec,
        guestName: userId ? null : guestName, // Logged in users don't need a guest name
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { error: dbError } = await supabase.from('comments').insert([{
        video_id: parsed.data.videoId,
        user_id: userId,
        content: parsed.data.content,
        timestamp_sec: parsed.data.timestampSec,
        guest_name: parsed.data.guestName,
    }]);

    if (dbError) {
        console.error('Guest 댓글 DB 오류:', dbError);
        return { error: '댓글 권한이 없거나 저장에 실패했습니다.' };
    }

    // Refresh both possible paths
    revalidatePath(`/watch/${videoId}`);
    revalidatePath(`/dashboard/videos/${videoId}`);
    return { success: true };
}

export async function getVideoDetailsForGuest(videoId: string) {
    const supabase = await createClient();

    // 1. Get video details. RLS policy ("Anyone can view public videos or own videos") will apply.
    const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

    if (videoError || !video) {
        return { error: '비공개 영상이거나 찾을 수 없습니다.' };
    }

    // 2. Additional manual check for 'restricted' visibility
    // If it's restricted, the user MUST be logged in (even if they are not the owner)
    // The RLS policy allows 'restricted' viewing, so we must enforce the login check here.
    const { data: userAuth } = await supabase.auth.getUser();
    const userId = userAuth?.user?.id;
    const isOwner = userId === video.user_id;

    if (video.visibility === 'restricted' && !userId) {
        return { error: '이 영상은 로그인한 사용자만 시청할 수 있도록 제한되어 있습니다.' };
    }

    // 3. Fetch comments (publicly visible if video is visible)
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
            isOwner,
        }
    };
}
