// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// push-file — write ONE file of the active child theme on a site over MCP (`child_theme_files`).
//
//   UPW_SITE=… UPW_AUTH=… node push-file.mjs <local-file> <path-in-child-theme> [--confirm]
//
// Without --confirm the site reports what would change and nothing is written (the tool is two-step);
// run again with --confirm. Images and fonts go as base64, text as-is. Every write is backed up on the
// site and undoable (undo_change).
import fs from 'fs';
import { connect } from './mcp.mjs';

const [local, dest, ...flags] = process.argv.slice(2);
if (!local || !dest) throw new Error('usage: push-file.mjs <local-file> <path-in-child-theme> [--confirm]');
const binary = /\.(png|jpe?g|gif|webp|svgz|woff2?|ttf|otf|ico)$/i.test(local);
const body = binary ? { data: fs.readFileSync(local).toString('base64') } : { content: fs.readFileSync(local, 'utf8') };
const r = await connect().call('child_theme_files', { action: 'write', path: dest, ...body, confirm: flags.includes('--confirm') });
console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 2));
