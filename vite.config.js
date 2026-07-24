import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sendContactEmail } from './src/lib/contactEmail.js';

/**
 * Dev-only middleware that mirrors the Vercel `/api/contact` function so the
 * contact form works with `npm run dev`. It is never included in the build.
 */
const apiPlugin = () => ({
  name: 'api-plugin',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url !== '/api/contact' || req.method !== 'POST') return next();

      const chunks = [];
      let size = 0;

      req.on('data', (chunk) => {
        size += chunk.length;
        // Guard against unbounded memory growth from a malformed request.
        if (size > 100_000) {
          res.statusCode = 413;
          res.end();
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });

      req.on('end', async () => {
        res.setHeader('Content-Type', 'application/json');
        try {
          const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const env = loadEnv('', process.cwd(), '');
          process.env.EMAIL_USER = env.EMAIL_USER;
          process.env.EMAIL_PASS = env.EMAIL_PASS;

          const result = await sendContactEmail(payload);
          res.statusCode = result.success ? 200 : result.status || 500;
          res.end(JSON.stringify(result));
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
        }
      });
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],

  build: {
    // Modern baseline: smaller output, no legacy transpilation overhead.
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    // Inline anything under 4kb so tiny icons/svgs cost zero extra requests.
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 900,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        /**
         * Split the heavy libraries into long-lived, separately cached chunks.
         * `three` + the r3f stack is by far the largest dependency here, and it
         * is only needed by the lazy WebGL backgrounds — keeping it out of the
         * main chunk is what makes first paint fast.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](three|postprocessing)[\\/]/.test(id)) {
            return 'three';
          }
          if (/[\\/]node_modules[\\/]@react-three[\\/]/.test(id)) {
            return 'r3f';
          }
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) {
            return 'motion';
          }
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) {
            return 'react-vendor';
          }
          if (/[\\/]node_modules[\\/](gsap|lenis)[\\/]/.test(id)) {
            return 'scroll';
          }
          return 'vendor';
        },
      },
    },
  },

  esbuild: {
    // Strip debug noise from production bundles.
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lenis'],
    // three is huge and only used by lazy routes; don't prebundle it eagerly.
    exclude: ['three'],
  },
});
