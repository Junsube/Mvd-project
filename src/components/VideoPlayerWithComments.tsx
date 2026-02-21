'use client';

import { useState, useRef, useActionState, useEffect } from 'react';
import { addComment } from '@/app/dashboard/videos/[id]/actions';
import { addGuestComment } from '@/app/watch/[id]/actions';
import styles from './VideoPlayerWithComments.module.css';
import { PlayCircle, MessageSquare } from 'lucide-react';

interface VideoPlayerProps {
    video: any;
    signedUrl: string;
    comments: any[];
    isGuest?: boolean;
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayerWithComments({
    video,
    signedUrl,
    comments,
    isGuest = false
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [pausedTime, setPausedTime] = useState<number | null>(null);
    const [state, formAction, isPending] = useActionState(isGuest ? addGuestComment : addComment, null);
    const formRef = useRef<HTMLFormElement>(null);

    const handlePause = () => {
        if (videoRef.current) {
            setPausedTime(videoRef.current.currentTime);
        }
    };

    const handlePlay = () => {
        setPausedTime(null);
    };

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            setPausedTime(null);
        }
    }, [state]);

    return (
        <div className={styles.container}>
            <div className={styles.videoSection}>
                <div className={styles.playerWrapper}>
                    <video
                        ref={videoRef}
                        src={signedUrl}
                        className={styles.player}
                        controls
                        controlsList="nodownload"
                        onPause={handlePause}
                        onPlay={handlePlay}
                    />
                </div>
                <div className={styles.videoInfo}>
                    <h1 className={styles.title}>{video.title}</h1>
                    <p className={styles.meta}>
                        {(video.file_size / (1024 * 1024)).toFixed(2)} MB • {new Date(video.created_at).toLocaleDateString()}
                    </p>
                    {video.description && <p className={styles.description}>{video.description}</p>}
                </div>
            </div>

            <div className={styles.commentSection}>
                <div className={styles.commentHeaderWrap}>
                    <MessageSquare size={20} className={styles.commentIcon} />
                    <h2 className={styles.commentHeader}>피드백 남기기</h2>
                </div>

                <form action={formAction} ref={formRef} className={styles.commentForm}>
                    <input type="hidden" name="videoId" value={video.id} />
                    <input type="hidden" name="timestampSec" value={pausedTime ?? ''} />

                    <div className={styles.inputWrapper}>
                        {pausedTime !== null && (
                            <div className={styles.timeTag}>
                                {formatTime(pausedTime)}
                            </div>
                        )}
                        {isGuest && (
                            <input
                                type="text"
                                name="guestName"
                                placeholder="이름 (익명 작성 시 필수)"
                                required
                                className={styles.nameInput}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.95rem'
                                }}
                            />
                        )}
                        <textarea
                            name="content"
                            className={styles.textarea}
                            placeholder={pausedTime !== null
                                ? "멈춘 구간에 대한 피드백을 남겨주세요."
                                : "영상을 일시정지하면 특정 시간대에 댓글을 남길 수 있습니다."}
                            required
                        />
                    </div>
                    {state?.error && <div className={styles.error}>{state.error}</div>}
                    <div className={styles.formFooter}>
                        <button type="submit" disabled={isPending} className={styles.submitBtn}>
                            {isPending ? '등록 중...' : '피드백 등록'}
                        </button>
                    </div>
                </form>

                <div className={styles.commentListWrapper}>
                    <ul className={styles.commentList}>
                        {comments.map((comment: any) => (
                            <li key={comment.id} className={styles.commentItem}>
                                <div className={styles.commentTop}>
                                    <div className={styles.commentMeta}>
                                        <span className={styles.author}>{comment.guest_name ? `${comment.guest_name} (게스트)` : (comment.user_id === video.user_id ? '작성자' : 'Reviewer')}</span>
                                        <span className={styles.date}>{new Date(comment.created_at).toLocaleString()}</span>
                                    </div>
                                    {comment.timestamp_sec !== null && (
                                        <button
                                            className={styles.timeLink}
                                            onClick={() => {
                                                if (videoRef.current) {
                                                    videoRef.current.currentTime = comment.timestamp_sec;
                                                    videoRef.current.play();
                                                }
                                            }}
                                            title="해당 시간으로 이동하여 재생"
                                        >
                                            <PlayCircle size={14} className={styles.playIcon} />
                                            {formatTime(comment.timestamp_sec)}
                                        </button>
                                    )}
                                </div>
                                <p className={styles.commentContent}>{comment.content}</p>
                            </li>
                        ))}
                        {comments.length === 0 && (
                            <div className={styles.emptyComments}>
                                아직 작성된 피드백이 없습니다.<br />첫 피드백을 남겨보세요!
                            </div>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
