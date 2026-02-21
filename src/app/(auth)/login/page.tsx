'use client';

import { loginWithOAuth } from './actions';
import styles from './login.module.css';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>영상 협업 툴에 로그인하세요</p>

                <div className={styles.socialGroup}>
                    <button
                        onClick={() => loginWithOAuth('google')}
                        className={styles.socialButton}
                    >
                        <Chrome size={20} />
                        Google로 계속하기
                    </button>
                </div>
            </div>
        </div>
    );
}
