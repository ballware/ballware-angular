const fs = require('node:fs/promises');
const path = require('node:path');

// Standard-Verzeichnis: projekt-root/fixtures
const localFixtures = path.resolve(__dirname, '../fixtures');

// ENV > sonst project/fixtures
const FIXTURES_ROOT = process.env.FIXTURES_ROOT || localFixtures;

function safeJoin(root, rel) {
  const base = path.resolve(root);
  const target = path.resolve(base, rel || '');

  // Path-Traversal verhindern
  if (!target.startsWith(base + path.sep) && target !== base) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return target;
}

function contentTypeFor(file) {
  if (file.endsWith('.json')) return 'application/json; charset=utf-8';
  if (file.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (file.endsWith('.csv')) return 'text/csv; charset=utf-8';
  return 'application/octet-stream';
}

function sendJson(res, body, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function sendBuffer(res, buf, type, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'no-store');
  res.end(buf);
}

function sendText(res, text, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(text);
}

module.exports = function fixturesMiddleware(router) {
  router.get(/^\/api\/fixtures\/?(.*)$/, async (req, res) => {
    try {
      const rawUrl = (req.originalUrl || req.url || '').split('?')[0];
      const match = rawUrl.match(/^\/api\/fixtures\/?(.*)$/);
      const rel = decodeURIComponent(match && match[1] ? match[1] : ''); // z.B. "page/locationPage.json"

      const endsWithSlash = rel === '' || rawUrl.endsWith('/');
      const target = safeJoin(FIXTURES_ROOT, rel);

      if (endsWithSlash) {
        const dirPath = rel === '' ? FIXTURES_ROOT : target;
        const items = await fs.readdir(dirPath, { withFileTypes: true });

        return sendJson(res, {
          path: '/' + rel,
          items: items.map(d => ({
            name: d.name,
            type: d.isDirectory() ? 'dir' : 'file',
          })),
        });
      }

      const data = await fs.readFile(target);
      return sendBuffer(res, data, contentTypeFor(target));
    } catch (e) {
      if (e.code === 'ENOENT') return sendText(res, 'Not Found', 404);
      if (e.statusCode === 403) return sendText(res, 'Forbidden', 403);
      return sendText(res, e.message || 'Internal Server Error', 500);
    }
  });
};
