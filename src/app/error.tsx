'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service securely
        // In production, we don't expose error details to the user
        console.error('An unexpected error occurred:', error.digest ? `Digest: ${error.digest}` : error.message);
    }, [error]);

    return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#d32f2f' }}>문제가 발생했습니다.</h2>
            <p style={{ color: '#555', marginBottom: '1.5rem' }}>
                서비스 이용에 불편을 드려 죄송합니다. 잠시 후 다시 시도해 주세요.
            </p>
            <button
                onClick={() => reset()}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                다시 시도
            </button>
        </div>
    );
}
