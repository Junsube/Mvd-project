'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteVideo } from '@/app/dashboard/actions';
import { useRouter } from 'next/navigation';

export default function DeleteVideoButton({ videoId, videoTitle }: { videoId: string, videoTitle: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`정말로 "${videoTitle}" 영상을 명단과 스토리지에서 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteVideo(videoId);
            if (result.error) {
                alert(result.error);
            }
        } catch (err) {
            alert('삭제 중 서버 네트워크 오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="영상 완전히 삭제"
            style={{
                padding: '0.45rem 0.65rem',
                backgroundColor: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                borderRadius: '6px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
                opacity: isDeleting ? 0.6 : 1,
                fontWeight: 500,
                fontSize: '0.9rem'
            }}
            onMouseOver={(e) => {
                if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }
            }}
            onMouseOut={(e) => {
                if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            <Trash2 size={16} />
            {isDeleting ? '삭제 중...' : '삭제'}
        </button>
    );
}
