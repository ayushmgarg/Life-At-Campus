/**
 * Inlines the Vite build into one self-contained .html file that opens by
 * double-click (file:// blocks <script type="module">, so the build is emitted
 * as a classic IIFE and pasted in here).
 *
 *   node tools/bundle-single.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

// stylesheets
html = html.replace(/<link rel="stylesheet"[^>]*href="\.?\/?([^"]+\.css)"[^>]*>/g, (_, href) => {
  const css = fs.readFileSync(path.join(dist, href), 'utf8');
  return `<style>\n${css}\n</style>`;
});

// Scripts. Vite emits <script type="module"> inside <head>, and a module is
// deferred until the document is parsed. An inline classic script is not — so
// inlining it where it stood would run it before <div id="root"> exists and
// nothing would mount. The code is pulled out here and appended at the end of
// <body> below.
const inlined = [];
html = html.replace(/<script[^>]*src="\.?\/?([^"]+\.js)"[^>]*><\/script>/g, (_, src) => {
  inlined.push(fs.readFileSync(path.join(dist, src), 'utf8'));
  return '';
});

html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');

// fonts are a progressive enhancement; keep the file usable with no network
html = html.replace(
  /<link href="https:\/\/fonts\.googleapis\.com[^>]*>/,
  (m) => m.replace('rel="stylesheet"', 'rel="stylesheet" media="all" onerror="this.remove()"'),
);

// a visible message if the page is opened in something that cannot run it
html = html.replace(
  '<div id="root"></div>',
  `<div id="root"></div>
    <noscript style="font:16px system-ui;display:block;padding:40px;max-width:40em;margin:auto">
      This page needs JavaScript. Open it in Chrome, Edge or Firefox.
    </noscript>`,
);

// the app code goes last, after the mount point exists
html = html.replace(
  '</body>',
  `${inlined.map((js) => `<script>\n${js}\n</script>`).join('\n')}\n  </body>`,
);

// fail the build rather than ship a file that cannot mount
const rootAt = html.indexOf('<div id="root">');
const scriptAt = html.indexOf('<script>');
if (rootAt === -1 || scriptAt === -1 || scriptAt < rootAt) {
  throw new Error('the inlined script must come after #root in the document');
}

// no spaces or brackets in the name: some Windows shells and file pickers choke on them
const outName = 'CampusLifeSimulator.html';
const out = path.join(root, outName);
fs.writeFileSync(out, html);
console.log(`wrote ${outName} — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
