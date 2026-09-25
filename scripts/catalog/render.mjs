// Renders catalog.html to scripts/catalog/katalog-vendingfresh.pdf (not published on the website — contains prices).
// Needs Playwright with Chromium: node scripts/catalog/render.mjs
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = process.env.OUT || path.resolve(dir, 'katalog-vendingfresh.pdf');
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(dir, 'catalog.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('saved', out);
