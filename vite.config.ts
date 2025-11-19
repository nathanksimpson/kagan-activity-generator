import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: Change this to match your repository name
// Example: if your repo is "my-kagan-app", change to '/my-kagan-app/'
// If deploying to root domain, use '/'
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'textbook-to-kagan-activity-app';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
})

