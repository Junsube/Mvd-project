import Link from 'next/link';
import styles from './page.module.css';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className={styles.main}>
      <header className={styles.header} style={{ justifyContent: 'space-between' }}>
        <Link href="/" className={styles.logo}>
          EDP
        </Link>
        <ThemeToggle />
      </header>

      <main className={styles.hero}>
        <h1 className={styles.title}>
          영상 피드백
        </h1>
        <Link href="/login" className={styles.ctaBtn}>
          로그인
        </Link>
      </main>

      {/* 하단 기능 설명(features) 섹션 전체 삭제 */}
    </div>
  );
}
