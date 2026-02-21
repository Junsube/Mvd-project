import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          EDP
        </Link>
        {/* 우측 상단 메뉴(소개, 요금, 로그인) 전체 삭제 */}
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
