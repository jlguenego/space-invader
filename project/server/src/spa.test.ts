import { describe, expect, test } from 'bun:test';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { AddressInfo } from 'node:net';

import { createApp } from './app';

async function makeTempDir(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'space-invaders-spa-'));
}

async function start(app: ReturnType<typeof createApp>) {
  const server = app.listen(0);
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}

describe('SPA static serving (topologie A)', () => {
  test('serves index.html for / and deep links; serves static assets', async () => {
    const tmpRoot = await makeTempDir();

    try {
      const assetsDir = path.join(tmpRoot, 'assets');
      await fs.mkdir(assetsDir, { recursive: true });

      const indexHtml =
        '<!doctype html><html><head><meta charset="utf-8" /></head><body><div id="root">ok</div></body></html>';
      await fs.writeFile(path.join(tmpRoot, 'index.html'), indexHtml, 'utf8');
      await fs.writeFile(path.join(assetsDir, 'test.txt'), 'hello', 'utf8');

      const app = createApp({ spa: { enabled: true, distDir: tmpRoot } });
      const srv = await start(app);

      try {
        const r1 = await fetch(`${srv.baseUrl}/`, {
          headers: { accept: 'text/html' },
        });
        expect(r1.status).toBe(200);
        expect(r1.headers.get('content-type') ?? '').toContain('text/html');
        expect(await r1.text()).toContain('<div id="root">ok</div>');

        const r2 = await fetch(`${srv.baseUrl}/some/spa/route`, {
          headers: { accept: 'text/html' },
        });
        expect(r2.status).toBe(200);
        expect(r2.headers.get('content-type') ?? '').toContain('text/html');
        expect(await r2.text()).toContain('<div id="root">ok</div>');

        const r3 = await fetch(`${srv.baseUrl}/assets/test.txt`);
        expect(r3.status).toBe(200);
        expect(await r3.text()).toBe('hello');

        // Missing assets should not get the SPA fallback.
        const r4 = await fetch(`${srv.baseUrl}/assets/missing.txt`, {
          headers: { accept: 'text/html' },
        });
        expect(r4.status).toBe(404);
      } finally {
        await srv.close();
      }
    } finally {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    }
  });
});
