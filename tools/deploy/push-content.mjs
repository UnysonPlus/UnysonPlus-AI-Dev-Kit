// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// push-content — send an export-content folder to a site over MCP: no seed plugin, no upload.
//
//   UPW_SITE=https://example.com UPW_AUTH=<base64 user:app-password> node push-content.mjs <export-dir> [--only=files,users,posts,menus,links]
//
// Order matters and is fixed: files (so content and featured images resolve) → users (authors exist
// before their posts) → posts (any type, with terms, featured image and Unyson post options) → menus →
// short links. Every step matches by slug / login / name on the site, so a re-run only fills gaps.
// Uses AI Assistant roadmap phase 30 tools: content_upsert, user_upsert, menu_set, short_links_import
// (+ upload_media, which exists today).
import fs from 'fs';
import path from 'path';
import { connect } from './mcp.mjs';

const [dir, ...flags] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(path.join(dir, 'content.json'), 'utf8'));
const only = (flags.find(f => f.startsWith('--only=')) || '--only=files,users,posts,menus,links').slice(7).split(',');
const site = connect();
const BATCH = 50;
const batches = (list) => Array.from({ length: Math.ceil(list.length / BATCH) }, (_, i) => list.slice(i * BATCH, (i + 1) * BATCH));
const media = {}; // uploads-relative path → media id on the site

if (only.includes('files')) {
  let skipped = 0;
  for (const rel of data.files) {
    try {
      const r = await site.call('upload_media', { filename: path.basename(rel), keep_path: rel,
        data: fs.readFileSync(path.join(dir, 'files', rel)).toString('base64') });
      media[rel] = r.id;
    } catch (e) {
      // A file already at that path (sent earlier, or re-encoded by the site's SVG sanitiser) is kept,
      // not replaced; content referring to its path still resolves. Anything else is a real failure.
      if (!/already exists/i.test(e.message)) throw e;
      skipped++;
    }
  }
  console.log(`files: ${data.files.length - skipped} sent, ${skipped} already on the site`);
}
const mediaRef = (rel) => (rel ? (media[rel] ? { id: media[rel] } : { file: rel }) : null);

if (only.includes('users') && data.users.length) {
  const r = await site.call('user_upsert', { users: data.users.map(({ photo, ...u }) => (photo ? { ...u, photo: mediaRef(photo) } : u)) });
  console.log('users:', r.message || JSON.stringify(r));
}
if (only.includes('posts')) {
  for (const b of batches(data.posts)) {
    // A post without a featured image sends no featured_image key at all (null is rejected by the tool).
    const r = await site.call('content_upsert', { items: b.map(({ featured_image, ...p }) => (featured_image ? { ...p, featured_image: mediaRef(featured_image) } : p)) });
    console.log('posts:', r.message || JSON.stringify(r));
  }
}
if (only.includes('menus')) {
  for (const m of data.menus) console.log('menu:', (await site.call('menu_set', m)).message || m.name);
}
if (only.includes('links') && data.short_links.length) {
  for (const b of batches(data.short_links)) {
    // clear_prefix: exported slugs already carry their folder (go/…, play/…), so the site's prefix is blanked.
    const r = await site.call('short_links_import', { rows: b, import_counts: true, clear_prefix: true });
    console.log('short links:', r.message || JSON.stringify(r));
  }
}
