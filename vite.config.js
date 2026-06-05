import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sendContactEmail } from './src/lib/contactEmail.js'

const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/contact' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);
            const env = loadEnv('', process.cwd(), '');
            process.env.EMAIL_USER = env.EMAIL_USER;
            process.env.EMAIL_PASS = env.EMAIL_PASS;
            
            const result = await sendContactEmail(payload);
            
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = result.success ? 200 : result.status || 500;
            res.end(JSON.stringify(result));
          } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
          }
        });
        return;
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
})
