import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient.js';
import AuthBox from './components/AuthBox.jsx';
import OrderForm from './components/OrderForm.jsx';

export default function App() {
  // 현재 로그인한 회원 (로그아웃 상태면 null)
  const [user, setUser] = useState(null);

  // 로그인/로그아웃이 일어날 때마다 user 갱신 (새로고침해도 로그인 유지)
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session ? session.user : null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="container">
      {/* 페이지 상단: 로고, 카페 이름, 부제 */}
      <header className="header">
        <div className="logo">☕</div>
        <h1>바이브 카페</h1>
        <p className="subtitle">당신의 하루에 바이브를 더하다</p>
      </header>

      <AuthBox user={user} />
      <OrderForm />
    </div>
  );
}
