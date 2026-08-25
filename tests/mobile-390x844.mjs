import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const browserPort = 9223;
const chromeProfile = '/tmp/undangan-mobile-check';
const baseUrl = 'http://127.0.0.1:4173/';
const artifacts = join(dirname(fileURLToPath(import.meta.url)), 'artifacts');
const reducedMotion = process.env.REDUCED_MOTION === '1';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForJson(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await sleep(150);
  }
  throw new Error(`Tidak dapat mengakses ${url}`);
}

await rm(chromeProfile, { recursive: true, force: true });
await mkdir(artifacts, { recursive: true });
const chrome = spawn(process.env.CHROME_BIN || '/usr/bin/chromium', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  `--remote-debugging-port=${browserPort}`, `--user-data-dir=${chromeProfile}`, 'about:blank'
], { stdio: 'ignore' });

try {
  const version = await waitForJson(`http://127.0.0.1:${browserPort}/json/version`);
  const socket = new WebSocket(version.webSocketDebuggerUrl);
  const messages = new Map();
  const consoleErrors = [];
  let commandId = 0;

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && messages.has(message.id)) {
      const { resolve, reject } = messages.get(message.id);
      messages.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') consoleErrors.push(message.params.exceptionDetails.text || 'Runtime exception');
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') consoleErrors.push(message.params.entry.text);
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++commandId;
    messages.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
    return result.result.value;
  };

  await command('Target.createTarget', { url: 'about:blank' });
  const pages = await waitForJson(`http://127.0.0.1:${browserPort}/json/list`);
  const page = pages.find(item => item.type === 'page' && item.url === 'about:blank');
  socket.close();

  const pageSocket = new WebSocket(page.webSocketDebuggerUrl);
  const pending = new Map();
  let pageCommandId = 0;
  await new Promise((resolve, reject) => {
    pageSocket.addEventListener('open', resolve, { once: true });
    pageSocket.addEventListener('error', reject, { once: true });
  });
  pageSocket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') consoleErrors.push(message.params.exceptionDetails.text || 'Runtime exception');
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') consoleErrors.push(message.params.entry.text);
  });
  const pageCommand = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++pageCommandId;
    pending.set(id, { resolve, reject });
    pageSocket.send(JSON.stringify({ id, method, params }));
  });
  const pageEvaluate = async expression => {
    const result = await pageCommand('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
    return result.result.value;
  };

  await pageCommand('Page.enable');
  await pageCommand('Runtime.enable');
  await pageCommand('Log.enable');
  await pageCommand('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await pageCommand('Emulation.setEmulatedMedia', { features: reducedMotion ? [{ name: 'prefers-reduced-motion', value: 'reduce' }] : [] });
  await pageCommand('Page.navigate', { url: baseUrl });
  await sleep(900);

  const triggerBox = JSON.parse(await pageEvaluate(`JSON.stringify(document.getElementById('envScene').getBoundingClientRect().toJSON())`));
  await pageCommand('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: triggerBox.x + triggerBox.width / 2, y: triggerBox.y + triggerBox.height / 2, radiusX: 1, radiusY: 1, force: 1, id: 1 }] });
  await pageCommand('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(1350);

  const openedState = JSON.parse(await pageEvaluate(`JSON.stringify({
    viewport: [window.innerWidth, window.innerHeight],
    opened: document.body.classList.contains('opened'),
    triggerDisabled: document.getElementById('envScene').disabled,
    overlayHidden: document.getElementById('opening').getAttribute('aria-hidden') === 'true',
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
  })`));
  const screenshot = await pageCommand('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(join(artifacts, 'mobile-390x844.png'), Buffer.from(screenshot.data, 'base64'));

  const pageHeight = await pageEvaluate('document.documentElement.scrollHeight');
  for (let y = 0; y < pageHeight; y += 420) {
    await pageEvaluate(`window.scrollTo(0, ${y})`);
    await sleep(160);
  }
  await sleep(450);
  const motionState = JSON.parse(await pageEvaluate(`JSON.stringify({
    total: document.querySelectorAll('[data-motion~="reveal"], [data-motion~="zoom"]').length,
    revealed: document.querySelectorAll('[data-motion~="reveal"].in, [data-motion~="zoom"].in').length,
    galleryCards: document.querySelectorAll('.gallery-card').length,
    activeGalleryCards: document.querySelectorAll('.gallery-card.is-active').length
  })`));

  const report = { openedState, motionState, consoleErrors };
  await writeFile(join(artifacts, 'mobile-390x844-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));

  if (openedState.viewport[0] !== 390 || openedState.viewport[1] !== 844) throw new Error('Viewport mobile tidak sesuai 390×844');
  if (openedState.reduced !== reducedMotion) throw new Error('Preferensi reduced motion tidak diterapkan');
  if (!openedState.opened || !openedState.triggerDisabled || !openedState.overlayHidden) throw new Error('Tap mobile tidak menyelesaikan pembukaan amplop');
  if (motionState.total !== motionState.revealed || motionState.activeGalleryCards !== 1) throw new Error('Reveal atau coverflow belum aktif penuh');
  if (consoleErrors.length) throw new Error(`Console error: ${consoleErrors.join(' | ')}`);
  pageSocket.close();
} finally {
  chrome.kill('SIGTERM');
}
