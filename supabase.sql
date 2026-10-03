-- =============================================
-- 바이브 카페 주문 테이블 (ssu_cafe)
-- Supabase SQL Editor에 그대로 붙여넣고 Run 하세요.
-- =============================================

create table if not exists public.ssu_cafe (
  id            bigint generated always as identity primary key,  -- 주문 번호 (자동 증가)
  customer_name text        not null,                             -- 1. 이름 (필수)
  phone         text,                                             -- 2. 전화번호
  drink         text        not null
                check (drink in ('아메리카노', '카페라떼', '카페모카', '바닐라라떼', '녹차라떼')),  -- 3. 음료
  size          text        not null default 'M'
                check (size in ('S', 'M', 'L')),                  -- 4. 사이즈 (기본 M)
  options       text[]      not null default '{}',                -- 5. 추가 옵션 (여러 개 → 배열)
  quantity      integer     not null default 1
                check (quantity between 1 and 10),                -- 6. 수량 (1~10)
  request       text,                                             -- 7. 요청사항
  total_price   integer     not null check (total_price >= 0),    -- 총 금액 (원)
  created_at    timestamptz not null default now()                -- 주문 시각
);

-- 테스트용 가짜 데이터 1건
-- 카페라떼 4,000 + M 500 + 샷 추가 500 = 5,000원 × 1잔
insert into public.ssu_cafe
  (customer_name, phone, drink, size, options, quantity, request, total_price)
values
  ('홍길동', '010-1234-5678', '카페라떼', 'M', array['샷 추가'], 1, '얼음 적게 주세요', 5000);

-- 확인용
select * from public.ssu_cafe;

-- =============================================
-- 회원 로그인 연동 (Supabase Auth)
-- 위 테이블을 만든 뒤, 아래도 SQL Editor에서 Run 하세요.
-- =============================================

-- 주문한 회원 ID (로그인한 회원의 id가 자동으로 들어감)
alter table public.ssu_cafe
  add column if not exists user_id uuid references auth.users (id) default auth.uid();

-- 행 단위 보안(RLS) 켜기: 정책에 맞는 요청만 허용
alter table public.ssu_cafe enable row level security;

-- 로그인한 회원은 자기 이름(user_id)으로만 주문 추가 가능
drop policy if exists "회원 주문 추가" on public.ssu_cafe;
create policy "회원 주문 추가" on public.ssu_cafe
  for insert to authenticated
  with check (user_id = auth.uid());

-- 로그인한 회원은 자기 주문만 조회 가능
drop policy if exists "회원 본인 주문 조회" on public.ssu_cafe;
create policy "회원 본인 주문 조회" on public.ssu_cafe
  for select to authenticated
  using (user_id = auth.uid());
