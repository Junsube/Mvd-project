import styles from './page.module.css';
import VideoUploader from '@/components/VideoUploader';
import { createClient } from '@/utils/supabase/server';
import { Video } from 'lucide-react';
import Link from 'next/link';
import DeleteVideoButton from '@/components/DeleteVideoButton';
import ShareVideoButton from '@/components/ShareVideoButton';

export default async function Dashboard() {
    const supabase = await createClient();

    // 1. Get current logged-in user
    const { data: userAuth } = await supabase.auth.getUser();
    const userId = userAuth?.user?.id;

    // 2. Fetch ONLY this user's videos
    // (RLS now allows 'public' videos to be read by anyone, so we MUST filter by user_id here for the personal dashboard)
    const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>내 작업 공간</h1>
            <p className={styles.subtitle}>최근 작업 중인 영상 및 피드백 현황을 한눈에 확인하세요.</p>

            <div className={styles.grid}>
                {/* 1. Upload Section */}
                <div className={styles.uploadSection}>
                    <VideoUploader />
                </div>

                {/* 2. Video Feed Section */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>내 비디오 보관함</h2>
                    {error ? (
                        <div className={styles.errorState}>데이터를 불러오지 못했습니다.<br />사유: {error.message} <br /> 코드: {error.code}</div>
                    ) : videos && videos.length > 0 ? (
                        <ul className={styles.videoList}>
                            {videos.map((video) => (
                                <li key={video.id} className={styles.videoItem}>
                                    <div className={styles.videoIcon}>
                                        <Video size={24} />
                                    </div>
                                    <div className={styles.videoInfo}>
                                        <h3 className={styles.videoTitle}>{video.title}</h3>
                                        <p className={styles.videoDate}>
                                            {new Date(video.created_at).toLocaleDateString()} • {(video.file_size / (1024 * 1024)).toFixed(1)} MB
                                        </p>
                                    </div>
                                    <div className={styles.actionsGroup}>
                                        <ShareVideoButton videoId={video.id} initialVisibility={video.visibility || 'restricted'} />
                                        <Link href={`/dashboard/videos/${video.id}`} className={styles.viewBtn}>리뷰하기</Link>
                                        <DeleteVideoButton videoId={video.id} videoTitle={video.title} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>아직 생성된 프로젝트가 없습니다.</p>
                            <span className={styles.emptySub}>왼쪽 업로더를 통해 첫 비디오를 등록해보세요.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
