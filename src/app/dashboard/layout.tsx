import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './layout.module.css';
import { LogOut, Home, Video, Users, Settings } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const handleLogout = async () => {
        'use server';
        const supabaseClient = await createClient();
        await supabaseClient.auth.signOut();
        revalidatePath('/', 'layout');
        redirect('/login');
    };

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>MVD Workspace</div>
                <nav className={styles.nav}>
                    <Link href="/dashboard" className={`${styles.navItem} ${styles.navItemActive}`}>
                        <Home size={20} />대시보드 홈
                    </Link>
                    {/* TODO: 향후 확장 시 활성화 예정
                    <Link href="/dashboard/projects" className={styles.navItem}>
                        <Video size={20} />프로젝트
                    </Link>
                    <Link href="/dashboard/team" className={styles.navItem}>
                        <Users size={20} />팀원 관리
                    </Link>
                    <Link href="/dashboard/settings" className={styles.navItem}>
                        <Settings size={20} />설정
                    </Link>
                    */}
                </nav>

                <form action={handleLogout} className={styles.logoutBtn} style={{ marginTop: 'auto' }}>
                    <button type="submit" style={{ all: 'unset', display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', cursor: 'pointer' }}>
                        <LogOut size={20} /> 로그아웃
                    </button>
                </form>
            </aside>

            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <span className={styles.userEmail}>{user.email}</span>
                </header>

                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
