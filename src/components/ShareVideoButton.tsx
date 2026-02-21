'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Globe, Lock, CheckCircle2, Copy } from 'lucide-react';
import { updateVideoVisibility } from '@/app/dashboard/actions';

export default function ShareVideoButton({
    videoId,
    initialVisibility
}: {
    videoId: string,
    initialVisibility: 'public' | 'restricted'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [visibility, setVisibility] = useState(initialVisibility);
    const [isUpdating, setIsUpdating] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleVisibilityChange = async (newVisibility: 'public' | 'restricted') => {
        if (visibility === newVisibility) return;

        setIsUpdating(true);
        try {
            const res = await updateVideoVisibility(videoId, newVisibility);
            if (res.error) {
                alert(res.error);
            } else {
                setVisibility(newVisibility);
            }
        } catch (error) {
            alert('상태 변경에 실패했습니다.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/watch/${videoId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="공유 및 권한 설정"
                style={{
                    padding: '0.45rem 0.65rem',
                    backgroundColor: visibility === 'public' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    border: visibility === 'public' ? '1px solid #3b82f6' : '1px solid #475569',
                    color: visibility === 'public' ? '#60a5fa' : '#cbd5e1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                    fontSize: '0.9rem'
                }}
                onMouseOver={(e) => {
                    if (visibility !== 'public') e.currentTarget.style.backgroundColor = '#334155';
                }}
                onMouseOut={(e) => {
                    if (visibility !== 'public') e.currentTarget.style.backgroundColor = 'transparent';
                }}
            >
                <Share2 size={16} />
                공유
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    right: 0,
                    width: '320px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
                        <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '0.95rem' }}>접근 권한 설정</h4>
                    </div>

                    {/* Restricted Option */}
                    <button
                        onClick={() => handleVisibilityChange('restricted')}
                        disabled={isUpdating}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                            backgroundColor: visibility === 'restricted' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            border: visibility === 'restricted' ? '1px solid #3b82f6' : '1px solid transparent',
                            borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                            opacity: isUpdating ? 0.5 : 1
                        }}
                    >
                        <div style={{ backgroundColor: '#0f172a', padding: '0.5rem', borderRadius: '50%', color: '#94a3b8' }}>
                            <Lock size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>일부 공개 (로그인 필요)</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>팀원이나 회원가입된 사용자만 볼 수 있습니다.</div>
                        </div>
                        {visibility === 'restricted' && <CheckCircle2 size={18} color="#3b82f6" />}
                    </button>

                    {/* Public Option */}
                    <button
                        onClick={() => handleVisibilityChange('public')}
                        disabled={isUpdating}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                            backgroundColor: visibility === 'public' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                            border: visibility === 'public' ? '1px solid #22c55e' : '1px solid transparent',
                            borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                            opacity: isUpdating ? 0.5 : 1
                        }}
                    >
                        <div style={{ backgroundColor: '#0f172a', padding: '0.5rem', borderRadius: '50%', color: '#22c55e' }}>
                            <Globe size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>전체 공개 (링크가 있는 모든 사용자)</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>링크를 통해 로그인 없이 누구나 영상을 보고 피드백을 남길 수 있습니다.</div>
                        </div>
                        {visibility === 'public' && <CheckCircle2 size={18} color="#22c55e" />}
                    </button>

                    {/* Copy Link Section */}
                    <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>외부 공유 링크</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                readOnly
                                value={`/watch/${videoId}`}
                                style={{
                                    flex: 1, padding: '0.5rem 0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155',
                                    borderRadius: '6px', color: '#94a3b8', fontSize: '0.85rem'
                                }}
                            />
                            <button
                                onClick={handleCopyLink}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 0.8rem',
                                    backgroundColor: copied ? '#22c55e' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px',
                                    cursor: 'pointer', fontWeight: 500, transition: 'background-color 0.2s', fontSize: '0.85rem'
                                }}
                            >
                                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                {copied ? '복사됨' : '링크 복사'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
