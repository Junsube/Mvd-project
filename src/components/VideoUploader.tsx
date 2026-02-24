'use client';

import { useState } from 'react';
import { addVideoMetadata } from '@/app/dashboard/actions';
import styles from './VideoUploader.module.css';
import { Youtube, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VideoUploader() {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const extractYouTubeId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        const videoId = extractYouTubeId(youtubeUrl);
        if (!videoId) {
            setErrorMsg('올바른 유튜브 링크를 입력해주세요.');
            return;
        }

        if (!title.trim()) {
            setErrorMsg('동영상 제목을 입력해주세요.');
            return;
        }

        setIsUploading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            // Call Server Action to save metadata
            const metadataRes = await addVideoMetadata({
                title,
                description,
                youtube_id: videoId,
            });

            if (metadataRes.error) {
                throw new Error(metadataRes.error);
            }

            setSuccessMsg('영상이 성공적으로 등록되었습니다!');
            setYoutubeUrl('');
            setTitle('');
            setDescription('');

        } catch (err: any) {
            setErrorMsg(err.message || '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.uploaderCard}>
            <h2 className={styles.headerTitle}>새 영상 등록 (YouTube 연동)</h2>
            <form onSubmit={handleUpload} className={styles.formContainer}>

                <div className={styles.formGroup}>
                    <label className={styles.label}>유튜브 링크 (URL)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Youtube className={styles.uploadIcon} style={{ position: 'absolute', left: '12px', color: '#ff0000' }} size={24} />
                        <input
                            type="text"
                            className={styles.input}
                            style={{ paddingLeft: '44px', width: '100%' }}
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            disabled={isUploading}
                            required
                        />
                    </div>
                </div>

                {youtubeUrl && (
                    <div className={styles.metadataFields}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>영상 제목</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="프로젝트 제목을 입력하세요"
                                disabled={isUploading}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>설명 (선택)</label>
                            <textarea
                                className={`${styles.input} ${styles.textarea}`}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="영상에 대한 간단한 설명을 남겨주세요"
                                disabled={isUploading}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isUploading}
                        >
                            {isUploading ? '등록 중...' : '프로젝트 등록'}
                        </button>
                    </div>
                )}

                {errorMsg && (
                    <div className={styles.errorBox}>
                        <AlertCircle size={20} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className={styles.successBox}>
                        <CheckCircle2 size={20} />
                        <span>{successMsg}</span>
                    </div>
                )}
            </form>
        </div>
    );
}
