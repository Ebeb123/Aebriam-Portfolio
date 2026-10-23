import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { readSiteMeta } from './scripts/site-meta.mjs'

// Fills %SITE_NAME% / %SITE_ROLE% / %SITE_DESCRIPTION% in index.html from siteContent.ts
const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const siteMeta = () => ({
  name: 'site-meta',
  transformIndexHtml(html: string) {
    const m = readSiteMeta()
    return html
      .replace(/%SITE_NAME%/g, esc(m.name))
      .replace(/%SITE_ROLE%/g, esc(m.role))
      .replace(/%SITE_DESCRIPTION%/g, esc(m.description))
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteMeta()],
  // "Last updated" in the footer = the day this build ran
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString()) },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          domegallery: ['@use-gesture/react'],
        },
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Reduce bundle size with esbuild (faster than terser)
    minify: 'esbuild',
    target: 'es2015',
  },
  // Enable CSS inlining for critical styles
  css: {
    devSourcemap: false,
  },
})
