import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages는 https://아이디.github.io/저장소이름/ 아래에서 열리므로 상대 경로 사용
  base: './',
});
