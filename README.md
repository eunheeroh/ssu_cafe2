# ☕ 바이브 카페 주문서

React + Supabase로 만든 카페 주문 웹앱입니다.

- 이메일 회원가입 / 로그인 / 로그아웃 (Supabase Auth)
- 음료·사이즈·옵션·수량에 따라 예상 금액 실시간 계산
- 로그인한 회원의 주문을 Supabase `ssu_cafe` 테이블에 저장

## 폴더 구조

```
├─ index.html
├─ src/
│  ├─ main.jsx            앱 시작점
│  ├─ App.jsx             로그인 상태 관리 + 화면 배치
│  ├─ supabaseClient.js   Supabase 연결
│  ├─ menu.js             메뉴·가격 데이터
│  ├─ style.css
│  └─ components/
│     ├─ AuthBox.jsx      로그인/회원가입/로그아웃
│     └─ OrderForm.jsx    주문서
└─ supabase.sql           테이블 생성 SQL
```

## 로컬에서 실행

1. Supabase SQL Editor에서 `supabase.sql`을 실행합니다.
2. `.env.example`을 복사해 `.env`로 만들고 Supabase URL과 anon key를 넣습니다.
3. 실행합니다.

```bash
npm install
npm run dev
```

## Vercel 배포

1. Vercel에서 이 GitHub 저장소를 Import합니다. (Framework Preset: Vite)
2. **Settings → Environment Variables**에 다음 두 값을 등록합니다.
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy 합니다. 이후 `main` 브랜치에 push하면 자동으로 다시 배포됩니다.
4. Supabase **Authentication → URL Configuration**의 Site URL에 Vercel 주소를 넣습니다.
