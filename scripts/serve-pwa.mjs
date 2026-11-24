import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer as httpServer, request } from 'node:http';
import { createServer as httpsServer } from 'node:https';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const root = fileURLToPath(new URL('../dist/polyforge/browser/', import.meta.url));
const index = resolve(root, 'index.html');
const host = 'localhost';
const httpPort = 8081;
const httpsPort = 8443;
const origin = `https://${host}:${httpsPort}`;
const key = process.env.POLYFORGE_TLS_KEY ?? 'tmp/https/localhost-key.pem';
const cert = process.env.POLYFORGE_TLS_CERT ?? 'tmp/https/localhost.pem';

if (![index, key, cert].every(existsSync)) {
  console.error('Ejecuta npm run build y configura los archivos TLS antes de iniciar la vista previa.');
  process.exit(1);
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function proxyApi(req, res) {
  const headers = { ...req.headers, host: 'localhost:8080' };
  delete headers.connection;
  const upstream = request({ hostname: 'localhost', port: 8080, path: req.url, method: req.method, headers }, (reply) => {
    res.writeHead(reply.statusCode ?? 502, reply.headers);
    reply.pipe(res);
  });
  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'Cache-Control': 'no-store' });
    res.end('API local no disponible');
  });
  req.pipe(upstream);
}

const secure = httpsServer({ key: readFileSync(key), cert: readFileSync(cert) }, (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(origin + req.url).pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    proxyApi(req, res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  const base = resolve(root) + sep;
  let file = resolve(root, '.' + pathname);
  if (file !== resolve(root) && !file.startsWith(base)) {
    res.writeHead(400).end();
    return;
  }
  if (!existsSync(file) || !statSync(file).isFile()) {
    if (extname(pathname)) {
      res.writeHead(404).end();
      return;
    }
    file = index;
  }
  const compressible = ['.html', '.js', '.css', '.json', '.webmanifest', '.svg'].includes(extname(file));
  const accepted = (req.headers['accept-encoding'] ?? '').split(',').map(value => value.trim());
  const encoding = compressible ? accepted.find(value => value === 'br' || value === 'gzip') : undefined;
  let body;
  if (encoding) {
    const source = readFileSync(file);
    body = encoding === 'br'
      ? brotliCompressSync(source, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } })
      : gzipSync(source);
  }
  res.writeHead(200, {
    ...(encoding ? { 'Content-Encoding': encoding } : {}),
    Vary: 'Accept-Encoding',
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
    'Content-Length': body ? body.length : statSync(file).size,
  });
  if (req.method === 'HEAD') res.end();
  else if (body) res.end(body);
  else createReadStream(file).pipe(res);
});

const redirect = httpServer((req, res) => {
  const path = req.url?.startsWith('/') ? req.url : '/';
  res.writeHead(308, { Location: origin + path, 'Cache-Control': 'no-store' }).end();
});

for (const server of [secure, redirect]) {
  server.on('error', (error) => {
    console.error(error.message);
    process.exit(1);
  });
}
secure.listen(httpsPort, host, () => console.log(origin));
redirect.listen(httpPort, host, () => console.log(`http://${host}:${httpPort} → ${origin}`));
