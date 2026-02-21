import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          MVD Collab
        </Link>
        <nav className={styles.nav}>
          <Link href="/about" className={styles.navLink}>소개</Link>
          <Link href="/pricing" className={styles.navLink}>요금</Link>
          <Link href="/login" className={styles.loginBtn}>로그인</Link>
        </nav>
      </header>

      <main className={styles.hero}>
        <h1 className={styles.title}>
          빠르고 명확한 영상 피드백
        </h1>
        <p className={styles.description}>
          프레임 단위의 정확한 리뷰, 간편한 버전 관리, 그리고 원활한 팀 협업.
          이제 영상 제작 프로세스를 한 단계 끌어올리세요.
        </p>
        <Link href="/login" className={styles.ctaBtn}>
          무료로 시작하기
        </Link>
      </main>

      <section className={styles.features}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🎯</div>
          <h3 className={styles.cardTitle}>프레임 단위 피드백</h3>
          <p className={styles.cardDesc}>
            영상 위에 직접 그림을 그리고 댓글을 남겨 정확한 수정 사항을 전달하세요.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🔄</div>
          <h3 className={styles.cardTitle}>버전 관리</h3>
          <p className={styles.cardDesc}>
            이전 버전과 나란히 비교하며 변경 사항을 쉽게 확인하고 승인할 수 있습니다.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🔒</div>
          <h3 className={styles.cardTitle}>강력한 보안</h3>
          <p className={styles.cardDesc}>
            모든 데이터는 엔터프라이즈급 보안 정책에 의해 안전하게 보호되며, 테넌트 간 완벽히 격리됩니다.
          </p>
        </div>
      </section>
    </div>
  );
}
