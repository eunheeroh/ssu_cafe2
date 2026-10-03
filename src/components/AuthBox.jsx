import { useState } from 'react';
import { supabase } from '../supabaseClient.js';

// 회원 로그인 / 회원가입 / 로그아웃 영역
export default function AuthBox({ user }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 이메일·비밀번호 입력 검사 함수
  function getCredentials() {
    const trimmed = email.trim();
    if (trimmed === '' || password.length < 6) {
      alert('이메일과 6자 이상의 비밀번호를 입력해주세요');
      return null;
    }
    return { email: trimmed, password };
  }

  // ===== 로그인 =====
  async function handleLogin(e) {
    e.preventDefault();
    const credentials = getCredentials();
    if (!credentials) return;

    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      alert('로그인 실패: ' + error.message);
      return;
    }
    setPassword('');
  }

  // ===== 회원가입 =====
  async function handleSignup() {
    const credentials = getCredentials();
    if (!credentials) return;

    const { data, error } = await supabase.auth.signUp({
      ...credentials,
      // 가입 확인 메일의 링크를 누르면 지금 보고 있는 사이트(로컬 또는 Vercel)로 돌아옴
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      alert('회원가입 실패: ' + error.message);
      return;
    }
    // 이메일 인증이 켜져 있으면 세션이 없음 → 메일 확인 안내
    if (!data.session) {
      alert('가입 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해주세요.');
    }
    setPassword('');
  }

  // ===== 로그아웃 =====
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) alert('로그아웃 실패: ' + error.message);
  }

  // 로그인 상태: 회원 정보 + 로그아웃 버튼
  if (user) {
    return (
      <div className="auth-box user-box">
        <span>{user.email}</span>님 환영합니다!
        <button type="button" className="btn-logout" onClick={handleLogout}>로그아웃</button>
      </div>
    );
  }

  // 로그아웃 상태: 로그인 폼
  return (
    <form className="auth-box" onSubmit={handleLogin} noValidate>
      <div className="field">
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          placeholder="6자 이상"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="buttons">
        <button type="submit" className="btn btn-order">로그인</button>
        <button type="button" className="btn btn-reset" onClick={handleSignup}>회원가입</button>
      </div>
    </form>
  );
}
