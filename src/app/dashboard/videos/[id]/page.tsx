import { getVideoDetails } from './actions';
import VideoPlayerWithComments from '@/components/VideoPlayerWithComments';
import Link from 'next/link';
import styles from './page.module.css';
import { ChevronLeft } from 'lucide-react';

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Server fetch for video data, signed URL, and comments
    const { data, error } = await getVideoDetails(id);

    if (error || !data) {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <h2>오류 발생</h2>
                    <p>{error || '비디오 정보를 불러오지 못했습니다.'}</p>
                    <Link href="/dashboard" className={styles.backBtn}>대시보드로 돌아가기</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/dashboard" className={styles.backLink}>
                    <ChevronLeft size={20} />
                    <span>목록으로 돌아가기</span>
                </Link>
            </div>

            <VideoPlayerWithComments
                video={data.video}
                youtubeId={data.youtubeId}
                comments={data.comments}
            />
        </div>
    );
}
