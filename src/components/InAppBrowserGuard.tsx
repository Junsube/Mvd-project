'use client';

import { useEffect, useState } from 'react';

export default function InAppBrowserGuard({ children }: { children: React.ReactNode }) {
    const [isIosInApp, setIsIosInApp] = useState(false);

    useEffect(() => {
        const useragt = navigator.userAgent.toLowerCase();
        const target_url = window.location.href;

        if (useragt.match(/kakaotalk/i)) {
            // 카카오톡 외부브라우저로 호출
            window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(target_url);
        } else if (useragt.match(/line/i)) {
            // 라인 외부브라우저로 호출
            if (target_url.indexOf('?') !== -1) {
                window.location.href = target_url + '&openExternalBrowser=1';
            } else {
                window.location.href = target_url + '?openExternalBrowser=1';
            }
        } else if (
            useragt.match(
                /inapp|naver|snapchat|wirtschaftswoche|thunderbird|instagram|everytimeapp|whatsApp|electron|wadiz|aliapp|zumapp|iphone(.*)whale|android(.*)whale|kakaostory|band|twitter|DaumApps|DaumDevice\/mobile|FB_IAB|FB4A|FBAN|FBIOS|FBSS|trill|SamsungBrowser\/[^1]/i
            )
        ) {
            // 그외 다른 인앱들
            if (useragt.match(/iphone|ipad|ipod/i)) {
                // 아이폰은 강제로 사파리를 실행할 수 없다 ㅠㅠ
                setIsIosInApp(true);
            } else {
                // 안드로이드는 Chrome이 설치되어있음으로 강제로 스킴실행한다.
                window.location.href =
                    'intent://' + target_url.replace(/https?:\/\//i, '') + '#Intent;scheme=http;package=com.android.chrome;end';
            }
        }
    }, []);

    const copyToClipboard = (val: string) => {
        const t = document.createElement('textarea');
        document.body.appendChild(t);
        t.value = val;
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
    };

    const inappbrowserout = () => {
        copyToClipboard(window.location.href);
        alert('URL주소가 복사되었습니다.\n\nSafari가 열리면 주소창을 길게 터치한 뒤, "붙여넣기 및 이동"를 누르면 정상적으로 이용하실 수 있습니다.');
        window.location.href = 'x-web-search://?';
    };

    if (isIosInApp) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                width: '100vw',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)',
                fontFamily: "'Inter', system-ui, sans-serif",
                textAlign: 'center',
                padding: '20px',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 99999
            }}>
                <h2 style={{ paddingTop: '50px', marginBottom: '20px', color: 'var(--text-primary)' }}>
                    인앱브라우저 호환문제로 인해<br />Safari로 접속해야합니다.
                </h2>
                <article style={{ fontSize: '17px', wordBreak: 'keep-all', color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.6' }}>
                    아래 버튼을 눌러 Safari를 실행해주세요<br />
                    Safari가 열리면, 주소창을 길게 터치한 뒤,<br />
                    '붙여넣기 및 이동'을 누르면<br />
                    정상적으로 이용할 수 있습니다.<br /><br />
                    <button
                        onClick={inappbrowserout}
                        style={{
                            minWidth: '180px',
                            marginTop: '10px',
                            height: '54px',
                            fontWeight: 700,
                            backgroundColor: 'var(--btn-primary)',
                            color: '#ffffff',
                            borderRadius: '6px',
                            fontSize: '17px',
                            border: 0,
                            cursor: 'pointer'
                        }}
                    >
                        Safari로 열기
                    </button>
                </article>
                <img
                    style={{ width: '80%', maxWidth: '400px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                    src='https://tistory3.daumcdn.net/tistory/1893869/skin/images/inappbrowserout.jpeg'
                    alt="Guide"
                />
            </div>
        );
    }

    return <>{children}</>;
}
