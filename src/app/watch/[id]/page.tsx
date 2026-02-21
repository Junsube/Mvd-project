import { getVideoDetailsForGuest } from './actions';
import VideoPlayerWithComments from '@/components/VideoPlayerWithComments';
import styles from '@/app/dashboard/videos/[id]/page.module.css';

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Server fetch for video data, signed URL, and comments (with visibility check)
    const { data, error } = await getVideoDetailsForGuest(id);

    if (error || !data) {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <h2>접근 제한</h2>
                    <p>{error || '비디오 정보를 불러오지 못했습니다. 삭제되었거나 비공개 상태일 수 있습니다.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ paddingTop: '2rem' }}>
            <div className={styles.header}>
                <h1 style={{ color: '#f8fafc', fontSize: '1.2rem', margin: 0 }}>
                    공유된 영상 시청 중:
                </h1>
            </div>

            <VideoPlayerWithComments
                video={data.video}
                signedUrl={data.signedUrl}
                comments={data.comments}
                isGuest={!data.isOwner}
            />
        </div>
    );
}
