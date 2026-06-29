const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const dataFile = path.join(rootDir, 'data', 'users.json');
const srcDir = path.join(rootDir, 'src');
const port = process.env.PORT || 5001;
function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return {};
  }
}

function writeUsers(users) {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function serveFile(filePath, res, baseDir = srcDir) {
  const fullPath = path.join(baseDir, filePath);
  const ext = path.extname(fullPath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.ico': 'image/x-icon'
  };

  if (!fs.existsSync(fullPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
  res.end(fs.readFileSync(fullPath));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/users') {
    sendJson(res, 200, readUsers());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/signin') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const { userId, password } = JSON.parse(body || '{}');
      const users = readUsers();
      if (!users[userId]) {
        sendJson(res, 401, { message: 'Account not found. Please sign up first.' });
        return;
      }

      if (users[userId] !== password) {
        sendJson(res, 401, { message: 'Password is incorrect. Please try again.' });
        return;
      }

      sendJson(res, 200, { ok: true, userId, message: `Welcome back, ${userId}!` });
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/signup') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const { userId, password } = JSON.parse(body || '{}');
      const users = readUsers();
      if (users[userId]) {
        sendJson(res, 409, { message: 'This ID already exists. Please sign in instead.' });
        return;
      }

      users[userId] = password;
      writeUsers(users);
      sendJson(res, 201, { ok: true, userId, message: `Account created and signed in as ${userId}.` });
    });
    return;
  }

  if (req.method === 'PUT' && url.pathname.startsWith('/api/users/')) {
    const segments = url.pathname.split('/').filter(Boolean);
    const userId = decodeURIComponent(segments[2]);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const { password } = JSON.parse(body || '{}');
      const users = readUsers();
      users[userId] = password;
      writeUsers(users);
      sendJson(res, 200, { ok: true, message: 'Password updated successfully.' });
    });
    return;
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/api/users/')) {
    const segments = url.pathname.split('/').filter(Boolean);
    const userId = decodeURIComponent(segments[2]);
    const users = readUsers();
    delete users[userId];
    writeUsers(users);
    sendJson(res, 200, { ok: true, message: 'Your account has been deleted.' });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
    sendJson(res, 200, { ok: true, message: 'Signed out successfully.' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/') {
    serveFile('index.html', res, srcDir);
    return;
  }

  if (req.method === 'GET' && (url.pathname === '/index.html' || url.pathname.startsWith('/src/'))) {
    serveFile(url.pathname.replace(/^\//, '').replace(/^src\//, ''), res, srcDir);
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/assets/')) {
    serveFile(url.pathname.replace(/^\//, '').replace(/^assets\//, ''), res, rootDir);
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please stop the existing server and try again.`);
    process.exit(1);
  } else {
    console.error(error);
    process.exit(1);
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
