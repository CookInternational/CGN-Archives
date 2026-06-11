#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.CGN_OUTPUT_ROOT
  ? path.resolve(process.env.CGN_OUTPUT_ROOT)
  : path.resolve(HERE, '..');

const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(ROOT, relative));
const errors = [];
const requireMatch = (text, regex, message) => { if (!regex.test(text)) errors.push(message); };
const forbidMatch = (text, regex, message) => { if (regex.test(text)) errors.push(message); };

const workflowPath = '.github/workflows/manual-index-article-pages.yml';
if (!exists(workflowPath)) errors.push('Manual article-indexing workflow is missing.');

const workflow = exists(workflowPath) ? read(workflowPath) : '';
const router = read('assets/archive-filter-router.js');
const css = read('assets/archive.css');
const builder = read('scripts/build-archive-pages.mjs');
const runtime = read('assets/archive-article-runtime.js');
const fallback404 = read('404.html');
const pages = ['index.html', 'news/index.html', 'weather/index.html', 'sports/index.html'].map(read);

requireMatch(workflow, /\bon:\s*\n\s*workflow_dispatch:\s*(?:\n|$)/, 'Workflow must use workflow_dispatch.');
forbidMatch(workflow, /\brepository_dispatch\s*:/, 'Workflow still has repository_dispatch.');
forbidMatch(workflow, /\bschedule\s*:/, 'Workflow still has a schedule.');
forbidMatch(workflow, /\bpush\s*:/, 'Workflow still has a push trigger.');
forbidMatch(workflow, /\bpull_request\s*:/, 'Workflow still has a pull_request trigger.');
forbidMatch(workflow, /\bworkflow_run\s*:/, 'Workflow still has a workflow_run trigger.');
requireMatch(workflow, /Index News, Weather and Sports article pages/, 'Workflow is not explicitly limited to article indexing.');

requireMatch(router, /archive-language-filters[^>]*notranslate/, 'Language controls are missing.');
requireMatch(router, /data-cgn-language-link/, 'Dynamic language buttons are missing.');
forbidMatch(router, /CITIES|VALID_BUREAUS|archive-bureau|setBureau|bureau=/i, 'City or bureau filter logic remains in the archive router.');

for (const page of pages) {
  requireMatch(page, /archive_live_index/, 'A live archive listing page no longer reads the Archives Sheet API.');
  requireMatch(page, /const PAGE_SIZE = 24;/, 'A live archive listing page no longer uses 24-item pagination.');
  requireMatch(page, /archiveLoadMore/, 'A live archive listing page is missing Load More.');
  forbidMatch(page, /state\.bureau|archive-bureau-change|params\.bureau|requestedBureau|normalizeArchiveBureau/i, 'A listing page still contains bureau filtering.');
}

forbidMatch(css, /archive-city-filters/i, 'City filter styling remains.');
forbidMatch(builder, /BUREAU_ALIASES|BUREAU_TIME|normalizeBureau|article\.bureau|\/\$\{bureau\}/i, 'Bureau route logic remains in the builder.');
forbidMatch(builder, /cleanGenerated|fs\.rm\s*\(/, 'The builder still deletes existing dated article trees.');
requireMatch(builder, /archive_live_index/, 'Builder no longer reads the live Archives Sheet index.');
requireMatch(builder, /archive-article-runtime\.js/, 'Generated article pages are missing the live Sheet runtime.');
requireMatch(builder, /next_offset/, 'Builder does not paginate through the full Archives Sheet.');

requireMatch(runtime, /archive_live_article/, 'Article runtime no longer reads current article data from the Archives Sheet.');
requireMatch(runtime, /archiveArticle/, 'Article runtime mount is missing.');
forbidMatch(runtime, /\bbureau\b|BUREAUS|CITIES/i, 'Bureau or city logic remains in the article runtime.');

requireMatch(fallback404, /archive_live_article/, '404 article fallback no longer reads the Archives Sheet.');
forbidMatch(fallback404, /\bbureau\b|BUREAUS|CITIES/i, 'Bureau or city route logic remains in 404.html.');

function collectArticlePages(section) {
  const base = path.join(ROOT, section);
  const found = [];
  if (!fs.existsSync(base)) return found;
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html' && /[\\/]\d{4}[\\/]\d{2}[\\/]\d{2}[\\/][^\\/]+[\\/]index\.html$/.test(full)) found.push(full);
    }
  }
  walk(base);
  return found;
}

const articlePages = ['news', 'weather', 'sports'].flatMap(collectArticlePages);
for (const file of articlePages) {
  const html = fs.readFileSync(file, 'utf8');
  requireMatch(html, /id="archiveArticle"/, `Live article mount missing from ${path.relative(ROOT, file)}.`);
  requireMatch(html, /\/assets\/archive-article-runtime\.js/, `Live article runtime missing from ${path.relative(ROOT, file)}.`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Archive validation passed: live Sheet listings, 24-item Load More, manual-only article indexing, non-destructive routes, and ${articlePages.length} live-refresh article pages verified.`);
