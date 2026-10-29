// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// ensure-kit — make sure the AI Dev Kit's local services are running, starting them if they are not.
//
//   node tools/ensure-kit.mjs            # start if needed, wait until ready, print the URLs (exit 1 on timeout)
//   node tools/ensure-kit.mjs --check    # report only, never start anything
//
//   import { ensureKit } from './ensure-kit.mjs';
//   await ensureKit();                   // the same, from another tool
//
// An agent running on the person's computer calls this instead of asking them to double-click start.bat.
// It checks the capture service (/health, port 8787 or $PORT) and the dashboard (port 4600 or
// $DASHBOARD_PORT); if either is down it launches the kit's own start script in its own minimised
// window (so the service outlives the agent's command) and waits up to 3 minutes — a first run
// assembles the kit and takes longer. Nothing here is needed to DEPLOY to a site (tools/deploy talks to
// the site directly); it is for the steps that use the local services: capture / convert, visual checks.
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVICE = `http://127.0.0.1:${Number(process.env.PORT) || 8787}/health`;
const DASHBOARD = `http://127.0.0.1:${Number(process.env.DASHBOARD_PORT) || 4600}/`;

async function up(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(2500) });
    return r.status < 500;
  } catch {
    return false;
  }
}

export async function status() {
  const [service, dashboard] = await Promise.all([up(SERVICE), up(DASHBOARD)]);
  return { service, dashboard, ready: service && dashboard };
}

function launch() {
  if (process.platform === 'win32') {
    const bat = path.join(KIT, 'start.bat');
    if (!fs.existsSync(bat)) throw new Error(`start.bat not found in ${KIT}`);
    // `start` gives the kit its own console window, detached from this process.
    spawn('cmd.exe', ['/c', 'start', '"Unyson+ AI Dev Kit"', '/min', bat], { cwd: KIT, detached: true, stdio: 'ignore', windowsHide: false }).unref();
  } else {
    const svc = path.join(KIT, 'assembled', 'UnysonPlus-Capture-Service', 'tools', 'design-capture');
    const log = fs.openSync(path.join(KIT, 'logs', `run-${Date.now()}.log`), 'a');
    spawn('node', ['serve.mjs'], { cwd: svc, detached: true, stdio: ['ignore', log, log] }).unref();
  }
}

export async function ensureKit({ timeoutMs = 180000, log = console.log } = {}) {
  let s = await status();
  if (s.ready) return s;
  log(`AI Dev Kit not running (service ${s.service ? 'up' : 'down'}, dashboard ${s.dashboard ? 'up' : 'down'}) — starting it…`);
  fs.mkdirSync(path.join(KIT, 'logs'), { recursive: true });
  launch();
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    await new Promise(r => setTimeout(r, 3000));
    s = await status();
    if (s.ready) return s;
  }
  throw new Error(`The AI Dev Kit did not come up within ${Math.round(timeoutMs / 1000)}s — see the newest file in ${path.join(KIT, 'logs')}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const s = process.argv.includes('--check') ? await status() : await ensureKit();
    console.log(JSON.stringify({ ...s, service_url: SERVICE.replace('/health', ''), dashboard_url: DASHBOARD }, null, 2));
    process.exitCode = s.ready ? 0 : 1; // not process.exit(): it trips a libuv assertion on Windows while fetch sockets close
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
