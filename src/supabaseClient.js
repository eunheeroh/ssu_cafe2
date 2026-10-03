import { createClient } from '@supabase/supabase-js';

// 주소와 키는 .env 파일에서 읽어옵니다.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
