// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// push-theme — zip a (child) theme folder and install it on a site over MCP: no upload by the owner.
//
//   UPW_SITE=https://example.com UPW_AUTH=<base64 user:app-password> node push-theme.mjs <theme-folder> [--activate]
//
// The zip is built with the system's bsdtar (forward-slash paths — WordPress's unzipper fails on
// backslash entries), the folder at the zip root, then sent in 1 MB pieces to `install_theme`
// (AI Assistant roadmap phase 28: install from file data). Re-running resumes/overwrites the same slug.
//
// Hosts that refuse to create .php files from an API request (WP Engine) answer { queued: true }: the
// package is staged and an administrator sees "A theme update from your AI app is ready" with Install /
// Discard in wp-admin. Check the result later with:  node push-theme.mjs --status <upload_id>
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { connect } from './mcp.mjs';

const [dir, ...flags] = process.argv.slice(2);
if (dir === '--status') {
  const r = await connect().call('install_theme', { upload_id: flags[0] });
  console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 2));
  process.exit(0);
}
if (!dir || !fs.existsSync(path.join(dir, 'style.css'))) throw new Error('Give a theme folder (it must contain style.css).');
const slug = path.basename(path.resolve(dir));
const zip = path.join(os.tmpdir(), `${slug}-${Date.now()}.zip`);
const tar = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:\Windows', 'System32', 'tar.exe') : 'bsdtar';
execFileSync(tar, ['-a', '-cf', zip, '--exclude=.git', '--exclude=node_modules', slug], { cwd: path.dirname(path.resolve(dir)) });

const buf = fs.readFileSync(zip);
const CHUNK = 1024 * 1024;
const count = Math.ceil(buf.length / CHUNK);
const upload_id = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16);
const site = connect();
let res;
for (let i = 0; i < count; i++) {
  res = await site.call('install_theme', {
    upload_id, chunk_index: i, chunk_count: count, filename: `${slug}.zip`,
    data: buf.subarray(i * CHUNK, (i + 1) * CHUNK).toString('base64'),
    activate: flags.includes('--activate'), confirm: true,
  });
  process.stdout.write(`\r${slug}: ${i + 1}/${count} pieces sent`);
}
fs.unlinkSync(zip);
console.log('\n' + (typeof res === 'string' ? res : JSON.stringify(res, null, 2)));
