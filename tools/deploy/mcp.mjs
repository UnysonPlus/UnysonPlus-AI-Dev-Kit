// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// Minimal client for a site's Unyson+ AI Assistant MCP endpoint (Application Password, HTTP Basic).
//
//   import { connect } from './mcp.mjs';
//   const site = connect();                       // reads UPW_SITE + UPW_AUTH (base64 "user:app-password")
//   const out = await site.call('site_info', {}); // parsed JSON result (throws on a tool error)
//
// CLI:  node mcp.mjs <tool> [<json> | @file.json]
import fs from 'fs';
import { fileURLToPath } from 'url';

export function connect(site = process.env.UPW_SITE, auth = process.env.UPW_AUTH) {
  if (!site || !auth) throw new Error('Set UPW_SITE (https://example.com) and UPW_AUTH (base64 of "user:application password").');
  const url = site.replace(/\/$/, '') + '/index.php?rest_route=/unysonplus-ai/v1/mcp';
  let id = 0;
  async function rpc(method, params) {
    const r = await fetch(url, { method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
      headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' } });
    const text = await r.text();
    let j; try { j = JSON.parse(text); } catch { throw new Error(`HTTP ${r.status}: ${text.slice(0, 300)}`); }
    if (j.error) throw new Error(`${j.error.code}: ${j.error.message}`);
    return j.result;
  }
  return {
    site,
    async tools() { return (await rpc('tools/list', {})).tools.map(t => t.name); },
    async call(name, args = {}) {
      const res = await rpc('tools/call', { name, arguments: args });
      const out = (res.content || []).map(c => c.text).join('\n');
      if (res.isError) throw new Error(`${name}: ${out}`);
      try { return JSON.parse(out); } catch { return out; }
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [tool, raw = '{}'] = process.argv.slice(2);
  const args = raw.startsWith('@') ? JSON.parse(fs.readFileSync(raw.slice(1), 'utf8')) : JSON.parse(raw);
  const out = await connect().call(tool, args);
  console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 2));
}
