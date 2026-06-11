#!/usr/bin/env node
/* ============================================================
   CGN ARCHIVES STATIC BUILDER — RESTORED ARTICLE PRESENTATION
   Uses the original archive article card, typography, spacing,
   visible publication date/time, and crawlable static HTML.
   ============================================================ */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.CGN_OUTPUT_ROOT
  ? path.resolve(process.env.CGN_OUTPUT_ROOT)
  : path.resolve(HERE, '..');

const SITE = 'https://archives.cgnnews.net';
const MAIN_SITE = 'https://www.cgnnews.net';
const PUBLIC_API = 'https://script.google.com/macros/s/AKfycbx41mQg-Ine3XZ-VrMI_SaQn4_K6cDQHA0cBFyGPgupu_edNFoNRjSLv2hoSe_bOytt/exec';
const API = String(process.env.CGN_API_URL || process.env.CGN_API_BASE || PUBLIC_API)
  .replace(/\?+$/, '')
  .replace(/\/+$/, '');
const FALLBACK_IMAGE = `${MAIN_SITE}/CGNWireBrief01.png`;

const MAIN_TIME = { timeZone: 'America/Indiana/Indianapolis', locale: 'en-US' };

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/<\/script/gi, '<\\/script');
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'article';
}


function requireDate(value, field, article) {
  const raw = String(value || '').trim();
  const parsed = new Date(raw);
  if (!raw || Number.isNaN(parsed.getTime())) {
    const identity = article?.article_id || article?.slug || article?.title || 'unknown article';
    throw new Error(`Invalid ${field} for ${identity}. The builder will not substitute the workflow date.`);
  }
  return parsed;
}

function publishedDate(article) {
  return requireDate(article.published_at, 'published_at', article);
}

function modifiedDate(article, published) {
  const raw = String(article.updated_at || '').trim();
  return raw ? requireDate(raw, 'updated_at', article) : published;
}

function sectionFamily(article) {
  const category = String(article.category || '').trim().toLowerCase();
  if (category === 'weather') return 'weather';
  if (category === 'sports') return 'sports';
  return 'news';
}

function articleRoute(article) {
  const published = publishedDate(article);
  const year = String(published.getUTCFullYear());
  const month = String(published.getUTCMonth() + 1).padStart(2, '0');
  const day = String(published.getUTCDate()).padStart(2, '0');
  return `/${sectionFamily(article)}/${year}/${month}/${day}/${slugify(article.slug || article.title)}/`;
}

function validAbsoluteImage(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return (url.protocol === 'http:' || url.protocol === 'https:') ? url.href : '';
  } catch {
    return '';
  }
}

function imageUrl(article) {
  return validAbsoluteImage(article.hero_image_url || article.image) || FALLBACK_IMAGE;
}

function categorySlug(category) {
  const raw = String(category || 'News').trim();
  const normalized = raw.toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9&]+/g, ' ').replace(/\s+/g, ' ').trim();
  const map = {
    'special reports': 'special-reports',
    'cgn special report': 'special-reports',
    investigations: 'investigations',
    'cgn investigates': 'investigations',
    'religion spirituality': 'religion-and-spirituality',
    'religion & spirituality': 'religion-and-spirituality',
    weather: 'weather',
    sports: 'sports'
  };
  return map[normalized] || slugify(raw);
}

function authorSlug(author) {
  const clean = String(author || 'CGN News Staff').trim() || 'CGN News Staff';
  if (/^cgn\s+news(\s+staff)?$/i.test(clean)) return 'cgn-news-staff';
  if (/^michael\s+a\.?\s+cook$/i.test(clean)) return 'michael-a-cook';
  return slugify(clean);
}

function categoryLink(category) {
  const label = category || 'News';
  return `<a class="archive-meta-link" href="${esc(`${MAIN_SITE}/category/${categorySlug(label)}/`)}">${esc(label)}</a>`;
}

function authorLink(author) {
  const label = author || 'CGN News Staff';
  return `<a class="archive-meta-link" href="${esc(`${MAIN_SITE}/reporters/${authorSlug(label)}/`)}">${esc(label)}</a>`;
}

function timeSettings(){ return MAIN_TIME; }

function formatVisibleDate(date, article) {
  const settings = timeSettings();
  const parts = new Intl.DateTimeFormat(settings.locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: settings.timeZone,
    timeZoneName: 'short'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const period = String(values.dayPeriod || '').toUpperCase();
  return `${values.day} ${values.month} ${values.year} at ${values.hour}:${values.minute}${period ? ` ${period}` : ''}${values.timeZoneName ? ` ${values.timeZoneName}` : ''}`;
}

async function loadArticles() {
  if (process.env.CGN_FIXTURE_FILE) {
    const fixture = JSON.parse(await fs.readFile(process.env.CGN_FIXTURE_FILE, 'utf8'));
    return Array.isArray(fixture) ? fixture : (fixture.articles || []);
  }

  const articles = [];
  let offset = 0;
  const limit = 500;

  for (let page = 0; page < 100; page += 1) {
    const url = new URL(API);
    url.searchParams.set('action', 'archive_live_index');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));

    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`Archives API request failed with HTTP ${response.status}.`);

    const data = await response.json();
    if (!data || data.success === false || !Array.isArray(data.articles)) {
      throw new Error(data?.error || 'Malformed Archives API response.');
    }

    articles.push(...data.articles);
    if (data.next_offset === null || typeof data.next_offset === 'undefined' || data.articles.length === 0) break;
    offset = Number(data.next_offset);
    if (!Number.isFinite(offset) || offset < 0) throw new Error('Archives API returned an invalid next_offset.');
  }

  return articles;
}

function articleDocument(article) {
  const published = publishedDate(article);
  const modified = modifiedDate(article, published);
  const publishedIso = published.toISOString();
  const modifiedIso = modified.toISOString();
  const showUpdated = modified.getTime() - published.getTime() >= 60_000;
  const route = articleRoute(article);
  const canonical = `${SITE}${route}`;
  const image = imageUrl(article);
  const title = String(article.title || '').trim();
  if (!title) throw new Error(`Missing title for ${article.article_id || route}.`);
  const description = article.seo_description || article.summary || article.subtitle || title;
  const author = article.author || 'CGN News Staff';
  const category = article.category || 'News';
  const body = article.body_html || '<p>This archived article body is not available.</p>';
  const analysis = article.what_this_means || article.analysis || '';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': canonical,
    mainEntityOfPage: canonical,
    headline: title,
    description,
    image: [image],
    datePublished: publishedIso,
    dateModified: modifiedIso,
    author: { '@type': 'Person', name: author },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'CGN News',
      url: MAIN_SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon-96x96.png` }
    },
    inLanguage: 'en'
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'CGN Archives', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: sectionFamily(article), item: `${SITE}/${sectionFamily(article)}/` },
      { '@type': 'ListItem', position: 3, name: title, item: canonical }
    ]
  };

  const dateLine = [
    `Published <time datetime="${esc(publishedIso)}">${esc(formatVisibleDate(published, article))}</time>`,
    showUpdated
      ? `Updated <time datetime="${esc(modifiedIso)}">${esc(formatVisibleDate(modified, article))}</time>`
      : ''
  ].filter(Boolean).join(' · ');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="cgn-api-base" content="${esc(API)}">
<meta name="theme-color" content="#07172f">
<meta name="robots" content="index,follow,max-image-preview:large">
<title>${esc(article.seo_title || title)} | CGN Archives</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/archive.css">
<style>
.archive-article-page{max-width:960px}
.archive-story{background:#fff;border:1px solid var(--line);box-shadow:0 18px 42px rgba(7,23,47,.12);padding:clamp(20px,4vw,44px)}
.archive-story h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(34px,5.4vw,64px);line-height:1.02;margin:8px 0 12px;letter-spacing:-.035em}
.archive-subtitle{font-size:20px;line-height:1.45;color:#475467}
.archive-hero-image img{width:100%;max-height:520px;object-fit:cover;background:#07172f}
.archive-hero-image figcaption{font-size:12px;color:#667085;margin-top:6px}
.archive-body,.archive-analysis{font-size:18px;line-height:1.72}
.archive-body p,.archive-analysis p{margin:0 0 18px}
.archive-analysis{border-top:1px solid var(--line);margin-top:28px;padding-top:20px}
.archive-analysis h2{font-family:Georgia,"Times New Roman",serif}
.archive-backlink a{font-weight:900;color:#07172f}
</style>
<meta property="og:type" content="article">
<meta property="og:site_name" content="CGN News">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(image)}">
<meta property="article:published_time" content="${esc(publishedIso)}">
<meta property="article:modified_time" content="${esc(modifiedIso)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
<script type="application/ld+json">${safeJson(articleJsonLd)}</script>
<script type="application/ld+json">${safeJson(breadcrumbJsonLd)}</script>
<script src="/assets/archive-filter-router.js"></script>
</head>
<body>
<div id="cgn-site-header"></div>
<main class="archive-shell archive-article-page">
<article class="archive-story" id="archiveArticle" data-archive-path="${esc(route)}" data-archive-slug="${esc(slugify(article.slug || article.title))}" data-archive-section="${esc(sectionFamily(article))}">
<div class="archive-kicker">${categoryLink(category)}</div>
<h1>${esc(title)}</h1>
${article.subtitle ? `<p class="archive-subtitle">${esc(article.subtitle)}</p>` : ''}
<div class="archive-meta">By ${authorLink(author)} · ${categoryLink(category)} · ${dateLine}</div>
<figure class="archive-hero-image">
<img src="${esc(image)}" alt="${esc(title)}" decoding="async" onerror="this.onerror=null;this.src='${esc(FALLBACK_IMAGE)}'">
<figcaption>${esc(article.image_credit || article.credit || 'CGN News')}</figcaption>
</figure>
<section class="archive-body">${body}</section>
${analysis ? `<section class="archive-analysis"><h2>What this means</h2>${analysis}</section>` : ''}
<p class="archive-backlink"><a href="/">Back to CGN Archives</a></p>
</article>
</main>
<div id="cgn-site-footer"></div>
<script src="/assets/cgn-shell.js"></script>
<script defer src="/assets/js/cgn-archive-v106.js"></script>
<script defer src="/assets/archive-article-runtime.js"></script>
</body>
</html>`;
}

async function write(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

const articles = await loadArticles();

for (const article of articles) {
  const file = path.join(ROOT, articleRoute(article).replace(/^\/+/, ''), 'index.html');
  await write(file, articleDocument(article));
}

const nowIso = new Date().toISOString();
const staticRoutes = ['/', '/news/', '/weather/', '/sports/'];
const sitemapEntries = [
  ...staticRoutes.map(route => ({ loc: `${SITE}${route}`, lastmod: nowIso })),
  ...articles.map(article => {
    const published = publishedDate(article);
    const modified = modifiedDate(article, published);
    return { loc: `${SITE}${articleRoute(article)}`, lastmod: modified.toISOString() };
  })
];

await write(
  path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map(entry => `  <url><loc>${esc(entry.loc)}</loc><lastmod>${esc(entry.lastmod)}</lastmod></url>`).join('\n')}\n</urlset>\n`
);

const cutoff = Date.now() - (48 * 60 * 60 * 1000);
const recent = articles.filter(article => publishedDate(article).getTime() >= cutoff);
await write(
  path.join(ROOT, 'news-sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${recent.map(article => `  <url><loc>${esc(`${SITE}${articleRoute(article)}`)}</loc><news:news><news:publication><news:name>CGN Archives</news:name><news:language>en</news:language></news:publication><news:publication_date>${esc(publishedDate(article).toISOString())}</news:publication_date><news:title>${esc(article.title)}</news:title></news:news></url>`).join('\n')}\n</urlset>\n`
);

await write(
  path.join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\nSitemap: ${SITE}/news-sitemap.xml\n`
);

console.log(JSON.stringify({
  success: true,
  articles: articles.length,
  recent: recent.length,
  api: API,
  restoredArticleClasses: [
    'archive-shell archive-article-page', 'archive-story', 'archive-kicker',
    'archive-subtitle', 'archive-meta', 'archive-hero-image',
    'archive-body', 'archive-analysis', 'archive-backlink'
  ]
}, null, 2));
