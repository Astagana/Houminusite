const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const scrypt = promisify(crypto.scrypt);

function ensureStore(){
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if(!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]\n');
}

function readUsers(){
  ensureStore();
  try{
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) || [];
  }catch(error){
    throw new Error('Penyimpanan akun rusak atau tidak dapat dibaca.');
  }
}

function writeUsers(users){
  ensureStore();
  const temporaryFile = `${USERS_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, `${JSON.stringify(users, null, 2)}\n`);
  fs.renameSync(temporaryFile, USERS_FILE);
}

function publicUser(user){
  return { name: user.name, email: user.email };
}

async function hashPassword(password){
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash){
  const [salt, key] = String(storedHash).split(':');
  if(!salt || !key) return false;
  const derivedKey = await scrypt(password, salt, 64);
  const expectedKey = Buffer.from(key, 'hex');
  return expectedKey.length === derivedKey.length && crypto.timingSafeEqual(expectedKey, derivedKey);
}

function readBody(request){
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if(body.length > 1024 * 1024) request.destroy(new Error('Request terlalu besar.'));
    });
    request.on('end', () => {
      try{ resolve(body ? JSON.parse(body) : {}); }
      catch(error){ reject(new Error('Format data tidak valid.')); }
    });
    request.on('error', reject);
  });
}

function sendJson(response, status, payload){
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function validCredentials(name, email, password){
  return typeof name === 'string' && name.trim().length >= 2 &&
    typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    typeof password === 'string' && password.length >= 8;
}

async function handleAuth(request, response, action){
  const body = await readBody(request);
  const users = readUsers();

  if(action === 'register'){
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    if(!validCredentials(name, email, body.password)) return sendJson(response, 400, { error: 'Data akun tidak valid.' });
    if(users.some(user => user.email === email)) return sendJson(response, 409, { error: 'Email sudah terdaftar.' });
    const user = { name, email, passwordHash: await hashPassword(body.password) };
    users.push(user);
    writeUsers(users);
    return sendJson(response, 201, { user: publicUser(user) });
  }

  if(action === 'login'){
    const email = body.email?.trim().toLowerCase();
    const user = users.find(candidate => candidate.email === email);
    if(!user || !(await verifyPassword(body.password || '', user.passwordHash))) return sendJson(response, 401, { error: 'Email atau kata sandi salah.' });
    return sendJson(response, 200, { user: publicUser(user) });
  }

  if(action === 'migrate'){
    if(!Array.isArray(body.users)) return sendJson(response, 400, { error: 'Data migrasi tidak valid.' });
    for(const oldUser of body.users){
      const email = oldUser.email?.trim().toLowerCase();
      if(!validCredentials(oldUser.name, email, oldUser.password) || users.some(user => user.email === email)) continue;
      users.push({ name: oldUser.name.trim(), email, passwordHash: await hashPassword(oldUser.password) });
    }
    writeUsers(users);
    return sendJson(response, 200, { migrated: true });
  }

  sendJson(response, 404, { error: 'Endpoint tidak ditemukan.' });
}

function serveStatic(request, response, pathname){
  const requestedPath = pathname === '/' ? '/login.html' : pathname;
  const filePath = path.resolve(ROOT, `.${requestedPath}`);
  if(!filePath.startsWith(`${ROOT}${path.sep}`)) return sendJson(response, 403, { error: 'Akses ditolak.' });
  fs.stat(filePath, (error, stats) => {
    if(error || !stats.isFile()) return sendJson(response, 404, { error: 'Halaman tidak ditemukan.' });
    const contentTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };
    response.writeHead(200, { 'Content-Type': `${contentTypes[path.extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
    fs.createReadStream(filePath).pipe(response);
  });
}

async function requestHandler(request, response){
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try{
    if(request.method === 'POST' && url.pathname.startsWith('/api/auth/')) return await handleAuth(request, response, url.pathname.split('/').pop());
    if(request.method === 'GET' && url.pathname === '/api/health') return sendJson(response, 200, { ok: true });
    if(request.method === 'GET') return serveStatic(request, response, url.pathname);
    sendJson(response, 405, { error: 'Metode tidak didukung.' });
  }catch(error){
    sendJson(response, 500, { error: error.message || 'Terjadi kesalahan pada server.' });
  }
}

ensureStore();

if(require.main === module){
  const server = http.createServer(requestHandler);
  server.listen(PORT, HOST, () => console.log(`Houminusite berjalan di http://localhost:${PORT}`));
}

module.exports = requestHandler;