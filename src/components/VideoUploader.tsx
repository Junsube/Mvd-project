'use client';

import { useState, useRef } from 'react';
import { addVideoMetadata, createUploadUrl } from '@/app/dashboard/actions';
import styles from './VideoUploader.module.css';
import { UploadCloud, FileVideo, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VideoUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            // Validate file type
            if (!selectedFile.type.startsWith('video/')) {
                setErrorMsg('비디오 파일만 업로드할 수 있습니다.');
                setFile(null);
                return;
            }
            // Max size 1GB
            if (selectedFile.size > 1024 * 1024 * 1024) {
                setErrorMsg('최대 1GB 이하의 파일만 허용됩니다.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setTitle(selectedFile.name.replace(/\.[^/.]+$/, '')); // Default title is filename without extension
            setErrorMsg(null);
            setSuccessMsg(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setErrorMsg('파일을 선택해주세요.');
            return;
        }
        if (!title.trim()) {
            setErrorMsg('동영상 제목을 입력해주세요.');
            return;
        }

        setIsUploading(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        setProgress(0);

        try {
            setStatusText('업로드 준비 중...');

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

            // 여전히 인증(회원 식별)을 위해 Supabase Auth 정보는 필요합니다
            const supabase = (await import('@/utils/supabase/client')).createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');
            }

            // Server Action을 통해 R2 업로드용 Presigned URL 발급받기 (및 9GB 한도 검사)
            const urlRes = await createUploadUrl(fileName, file.type);

            if (urlRes.error || !urlRes.data) {
                throw new Error(urlRes.error || '업로드 세션 생성 실패');
            }

            const { filePath, fullUrl } = urlRes.data;

            setStatusText('스토리지로 업로드 중...');

            // XHR(표준 브라우저 API)을 이용하여 Cloudflare R2로 직접 Binary PUT 전송
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', fullUrl, true);
                xhr.setRequestHeader('Content-Type', file.type);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        setProgress(Math.round(percentComplete));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(true);
                    } else {
                        reject(new Error(`R2 서버 응답 오류: ${xhr.status}`));
                    }
                };

                xhr.onerror = () => {
                    reject(new Error('네트워크 오류로 파일 전송에 실패했습니다.'));
                };

                xhr.send(file);
            });

            setProgress(100);
            setStatusText('DB 정보 저장 중...');

            // Call Server Action to save metadata
            const metadataRes = await addVideoMetadata({
                title,
                description,
                file_path: filePath,
                file_size: file.size,
                content_type: file.type,
            });

            if (metadataRes.error) {
                throw new Error(metadataRes.error);
            }

            setSuccessMsg('업로드가 완료되었습니다!');
            setFile(null);
            setTitle('');
            setDescription('');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (err: any) {
            const extra = err.cause ? ` (Cause: ${err.cause})` : '';
            setErrorMsg((err.message || '알 수 없는 오류가 발생했습니다.') + extra);
        } finally {
            setIsUploading(false);
            if (!successMsg && !errorMsg) setProgress(0);
            setStatusText('');
        }
    };

    return (
        <div className={styles.uploaderCard}>
            <h2 className={styles.headerTitle}>새 영상 업로드</h2>
            <form onSubmit={handleUpload} className={styles.formContainer}>

                {/* File Drop / Select Area */}
                <div
                    className={`${styles.dropZone} ${file ? styles.hasFile : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        accept="video/*"
                        ref={fileInputRef}
                        className={styles.fileInput}
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    {file ? (
                        <div className={styles.selectedFile}>
                            <FileVideo className={styles.fileIcon} size={40} />
                            <p className={styles.fileName} title={file.name}>{file.name}</p>
                            <p className={styles.fileSize}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div className={styles.emptyZone}>
                            <UploadCloud className={styles.uploadIcon} size={48} />
                            <p className={styles.dropText}>영상을 클릭하거나 드래그하여 업로드하세요 (MP4 등 최대 1GB)</p>
                        </div>
                    )}
                </div>

                {/* Metadata Inputs */}
                {file && (
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
                            {isUploading ? statusText : '업로드 시작'}
                        </button>
                    </div>
                )}

                {/* Status Messages */}
                {isUploading && (
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBarWrapper}>
                            <div
                                className={styles.progressBar}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
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
