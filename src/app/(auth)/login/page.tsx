'use client';

import { useState } from 'react';
import { loginWithOAuth } from './actions';
import styles from './login.module.css';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
    const [autoLogin, setAutoLogin] = useState(true);

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>영상 협업 툴에 로그인하세요</p>

                <div className={styles.optionsGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={autoLogin}
                            onChange={(e) => setAutoLogin(e.target.checked)}
                            className={styles.checkbox}
                        />
                        <span>자동 로그인 유지</span>
                    </label>
                </div>

                <div className={styles.socialGroup}>
                    <button
                        onClick={() => loginWithOAuth('google', autoLogin)}
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
