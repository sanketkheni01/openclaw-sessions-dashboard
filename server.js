import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3847;

// Read sessions directly from the sessions store
function getSessions() {
  try {
    const raw = fs.readFileSync('/root/.openclaw/agents/main/sessions/sessions.json', 'utf-8');
    const store = JSON.parse(raw);
    // sessions.json is { sessions: { [key]: sessionData } }
    const sessions = Object.entries(store.sessions || store).map(([key, s]) => ({
      key,
      ...s
    }));
    return JSON.stringify({ count: sessions.length, sessions });
  } catch(e) {
    return JSON.stringify({ count: 0, sessions: [], error: e.message });
  }
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (url.pathname === '/data/sessions.json') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(getSessions());
    return;
  }
  
  let filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'text/plain' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎛️  Dashboard: http://localhost:${PORT}`);
  console.log(`🌐 Tailscale: http://100.94.239.70:${PORT}`);
});
