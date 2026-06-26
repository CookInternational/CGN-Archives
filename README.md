[README.md](https://github.com/user-attachments/files/29233543/README.md)
<img src="CGNNewsLogo01.png" alt="CGN News" width="240">

# CGN Archives v1.1.0 Alpha

**Plain-English + Technical README / Operating Manual**  
Live Sheet Archives | Read-Only Archive Site | Manual Article Indexing | News Archives | Weather Archives | Sports Archives | Search | Year Filters | Category Filters | Load More | SEO | Sitemaps | Robots | GitHub Pages | Apps Script Web App | Static Article Routes | 404 Article Runtime | Archive Article Runtime | Manual Workflow Dispatch

**Updated:** 25 June 2026 • 19:43:00Z UTC
**Archive Build Stamp:** 25 June 2026 • 19:43:00Z UTC | Developed by Cook Technology Services  
**Archive Version:** `CGN ARCHIVES v1.1.0 Alpha`  
**Archive Slug:** `cgn-archives-v1.1.0-alpha`  
**Repository:** `CookInternational/CGN-Archives`  
**Site:** https://archives.cgnnews.net

CGN News / Cook Global News Network  
Market Square Center  
151 N. Delaware Street, Suite 122  
Indianapolis, IN 46204  
tips@cgnnews.net | www.cgnnews.net | +1 (317) 442-1437 | Copyright © 2026 | CGN News/Cook Global News Network | All Rights Reserved.

---

## What's Changed in v1.1.0 Alpha?

v1.1.0 Alpha Updated global header to add CGN NOW mobile iOS icon. locks the CGN Archives repository as the public read-only archive website for CGN News.

The archive site serves `https://archives.cgnnews.net` and reads the canonical CGN Archives Google Sheet through the deployed CGN Apps Script Web App. The repository does not write to the Archives Sheet, does not edit article rows, does not timestamp archive records, does not publish or unpublish records, and does not mutate the archive source of truth.

This build also locks physical article-page indexing as a **manual-only** workflow. Live index pages and search remain automatic because they read current Sheet data at request time, but physical dated article directories are generated only when an operator manually runs the workflow.

### Fixed and locked in this build

- Defines the Archives Sheet as the canonical source of truth.
- Keeps the archive website read-only.
- Keeps `/`, `/news/`, `/weather/`, `/sports/`, search, year filters, category filters, and Load More connected to live Sheet data through Apps Script.
- Keeps default archive index loading at 24-at-a-time pagination.
- Keeps indexed article bodies available through the live article runtime and physical article routes.
- Keeps manual article indexing limited to `/news/YYYY/MM/DD/slug/`, `/weather/YYYY/MM/DD/slug/`, and `/sports/YYYY/MM/DD/slug/`.
- Keeps the GitHub Actions article-index workflow manual-only through `workflow_dispatch`.
- Confirms there is no automatic scheduled archive indexing trigger.
- Confirms there is no city selector, bureau selector, bureau filter, bureau-prefixed archive route, or Bureaus Sheet dependency.
- Preserves the global archive shell and archive-domain SEO assets.
- Preserves `sitemap.xml`, `news-sitemap.xml`, and `robots.txt` as archive-domain search metadata files.

---

## 1. Executive Summary

CGN Archives v1.1.0 Alpha is the public long-term archive website for CGN News.

Plain-English explanation: readers can browse archived CGN News, Weather, and Sports articles at `archives.cgnnews.net`. The archive pages ask the CGN backend for the current archive records from the Archives Sheet. The public website is read-only and does not change the Sheet.

Technical explanation: the archive site is a GitHub Pages-hosted static frontend backed by the deployed CGN Apps Script Web App. The live index/search/filter pages request archive data from the backend. Manual indexing creates static, crawlable article routes only when an operator triggers the workflow. The repository does not contain or operate a city/bureau archive publishing system.

---

## 2. Build Lock

| Item | Current value |
|---|---|
| Archive repository | `CookInternational/CGN-Archives` |
| Production site | `https://archives.cgnnews.net` |
| Archive version | `CGN ARCHIVES v1.1.0 Alpha` |
| Archive slug | `cgn-archives-v1.1.0-alpha` |
| Archive build stamp | `2026-06-23T04:21:58Z` |
| README updated | `23 June 2026 • 04:21:58Z UTC` |
| Source of truth | CGN Archives Google Sheet |
| Archive spreadsheet ID | `10fc54JySFubbR1iGXsv_jDC-q9GY1dAgkYPln-L_Erk` |
| Archive sheet/tab | `Archives` |
| Archive sheet GID | `76333947` |
| Web App URL | `https://script.google.com/macros/s/AKfycbx41mQg-Ine3XZ-VrMI_SaQn4_K6cDQHA0cBFyGPgupu_edNFoNRjSLv2hoSe_bOytt/exec` |
| Main archive landing page | `/` |
| News archive page | `/news/` |
| Weather archive page | `/weather/` |
| Sports archive page | `/sports/` |
| Default page size | `24` |
| Article indexing workflow | `/.github/workflows/manual-index-article-pages.yml` |
| Workflow trigger | `workflow_dispatch` only |
| Indexed article families | `/news/`, `/weather/`, `/sports/` |
| Sitemap files | `sitemap.xml`, `news-sitemap.xml` |
| Search control file | `robots.txt` |
| Archive runtime | `archive-article-runtime.js` where present |
| Static builder | `build-archive-pages.mjs` where present |
| Main site | `https://www.cgnnews.net` |

Critical controls:

- The archive site remains read-only.
- The Archives Sheet remains the source of truth.
- The frontend must not attempt to download the entire Sheet at once.
- The archive index pages use live backend pagination and filtering.
- The workflow for physical article routes is manual-only.
- The workflow must not have `schedule`, `push`, `pull_request`, `repository_dispatch`, or chained automatic triggers.
- The builder must not mass-delete existing dated article directories.
- `/news/` is a News archive index and must not display Weather or Sports article rows as News archive content.
- `/weather/` and `/sports/` remain their own archive sections.
- The archive has no active Cities or Bureaus archive system.

---

## 3. Source of Truth Contract

The public archive website reads the existing CGN Archives Google Sheet through the deployed Apps Script Web App.

| Source item | Value |
|---|---|
| Spreadsheet ID | `10fc54JySFubbR1iGXsv_jDC-q9GY1dAgkYPln-L_Erk` |
| Sheet GID | `76333947` |
| Sheet/tab role | Long-term CGN News archive record source |
| Web App URL | `https://script.google.com/macros/s/AKfycbx41mQg-Ine3XZ-VrMI_SaQn4_K6cDQHA0cBFyGPgupu_edNFoNRjSLv2hoSe_bOytt/exec` |
| Website mode | Read-only |
| Public mutation | Not allowed |

Locked rules:

- The archive frontend does not write to the Sheet.
- The archive frontend does not edit Sheet data.
- The archive frontend does not timestamp rows.
- The archive frontend does not publish or unpublish rows.
- The archive frontend does not modify article bodies.
- The archive frontend does not create a second source of truth.
- Static JSON artifacts, if present, are legacy/support files only and are not the canonical archive source.

---

## 4. Automatic Live Behavior

These pages always read current Sheet data automatically and do not require a workflow run:

- `/`
- `/news/`
- `/weather/`
- `/sports/`
- Search
- Year filters
- Category filters
- 24-at-a-time Load More
- Existing indexed article bodies through the live article runtime

Ordinary repository updates continue publishing through the repository's existing GitHub Pages branch configuration.

Live archive queries use backend pagination and filters rather than loading the entire archive sheet into the browser.

| Query behavior | Purpose |
|---|---|
| `limit` | Controls page size, normally 24 records. |
| `offset` | Loads the next page of results. |
| `q` | Searches archive records. |
| `year` | Filters by year. |
| `category` | Filters by News, Weather, Sports, or other supported archive categories. |

---

## 5. Manual-Only Article Indexing

The only GitHub Actions workflow for article indexing is:

`/.github/workflows/manual-index-article-pages.yml`

It has one trigger:

`workflow_dispatch`

The workflow manually creates or refreshes physical indexed article routes and indexing metadata for:

- `/news/YYYY/MM/DD/slug/`
- `/weather/YYYY/MM/DD/slug/`
- `/sports/YYYY/MM/DD/slug/`

Locked workflow rules:

- No schedule trigger.
- No push trigger.
- No pull-request trigger.
- No repository-dispatch trigger.
- No chained automatic trigger.
- No daily automatic run.
- No mass-delete of existing dated article directories.
- No bureau article route generation.
- No city article route generation.

Manual indexing is for search-engine-friendly physical article routes only. It is not required for the live archive indexes to show current Sheet data.

---

## 6. News, Weather, and Sports Archive Contract

| Archive section | Route | Locked behavior |
|---|---|---|
| Main archive | `/` | Archive landing page and global archive discovery. |
| News archive | `/news/` | News-category archive index only. |
| Weather archive | `/weather/` | Weather-category archive index only. |
| Sports archive | `/sports/` | Sports-category archive index only. |

Locked rules:

- The News archive page must not display Weather or Sports article rows as News archive content.
- Weather articles belong on `/weather/`.
- Sports articles belong on `/sports/`.
- News, Weather, and Sports physical article pages use their own route family.
- Category and byline metadata should remain clickable where supported.
- Article bodies should display archived content without changing the record.

---

## 7. No Cities or Bureaus Archive System

The archive has no active city or bureau archive system.

Locked rules:

- No city selector.
- No bureau selector.
- No `bureau=` filtering.
- No bureau-prefixed archive routes.
- No Bureaus Sheet dependency.
- No bureau article API.
- No city archive workflow.
- No city archive sitemap family.
- No city archive dropdown behavior.

Legacy city or bureau-named directories, if present in the repository, are not part of the active archive contract and must not be revived into a city/bureau archive system.

---

## 8. Static Route and Runtime Contract

The archive supports static, crawlable article routes for manually indexed articles.

| Route family | Purpose |
|---|---|
| `/news/YYYY/MM/DD/slug/` | Indexed archived News article page. |
| `/weather/YYYY/MM/DD/slug/` | Indexed archived Weather article page. |
| `/sports/YYYY/MM/DD/slug/` | Indexed archived Sports article page. |

Runtime rules:

- `404.html` may resolve article paths for archive display where needed.
- Article runtime code may fetch live article data from the backend or consume indexed metadata.
- Existing indexed article bodies must keep displaying.
- Paywall logic belongs to the main dynamic article system, not the read-only Archives public index.
- Archive article pages should not mutate source records.

---

## 9. SEO, Sitemap, and Robots Contract

SEO files remain part of the archive site.

| File | Role |
|---|---|
| `sitemap.xml` | General archive-domain sitemap. |
| `news-sitemap.xml` | Recent/news article indexing metadata where used. |
| `robots.txt` | Search crawler rules and sitemap discovery. |
| `site.webmanifest` | Archive-domain web manifest and icon metadata. |
| favicon/icon files | Archive-domain browser identity. |

Locked rules:

- `sitemap.xml` must list archive landing/index pages and any approved indexed article routes.
- `news-sitemap.xml` must remain aligned with the archive article-indexing policy.
- `robots.txt` must list the applicable archive-domain sitemap files.
- SEO metadata should use archive-domain canonical URLs.
- Sitemap updates should not require restoring automated article-indexing triggers.

---

## 10. Global Shell and Frontend Contract

The global archive shell remains unchanged unless a specific shell bug is being fixed.

Locked rules:

- Do not redesign the global shell during article-indexing fixes.
- Do not remove live Sheet loading behavior.
- Do not remove search.
- Do not remove year filters.
- Do not remove category filters.
- Do not remove 24-at-a-time Load More behavior.
- Do not add a city or bureau selector.
- Do not connect the archive frontend to a Bureaus Sheet.
- Do not convert the archive to a static JSON-only archive.

---

## 11. Apps Script Archive API Contract

The archive frontend depends on read-only Apps Script archive endpoints.

Expected archive route/action family:

| Action family | Purpose |
|---|---|
| `archive_live_index` | Returns live archive index data with pagination, search, year, and category filtering. |
| `archive_live_article` | Returns a live archived article record/body for article display. |
| `archive_live_diagnostic` | Supports archive diagnostics where enabled. |

Locked rules:

- Archive actions read from the Archives Sheet.
- Archive actions do not write archive rows.
- Archive actions do not publish or unpublish archive rows.
- Archive actions do not replace the main Articles workflow.
- Archive actions do not revive the retired Bureaus Sheet system.

---

## 12. GitHub Pages and Workflow Contract

The repository publishes through GitHub Pages.

| Area | Locked behavior |
|---|---|
| Normal site publish | Repository updates publish through existing GitHub Pages configuration. |
| Manual article indexing | Operator runs `manual-index-article-pages.yml` manually. |
| Article route generation | News, Weather, and Sports dated article directories only. |
| Trigger policy | `workflow_dispatch` only for article indexing. |
| Delete policy | Builder does not mass-delete existing dated article directories. |

Do not add scheduled publishing unless the archive indexing policy is explicitly changed.

---

## 13. Deployment Runbook

1. Make the required surgical file change locally.
2. Confirm the archive site still uses `https://archives.cgnnews.net`.
3. Confirm `README.md` remains at the repository root.
4. Confirm live pages `/`, `/news/`, `/weather/`, and `/sports/` still read from the Archives Sheet.
5. Confirm search returns Sheet-backed results beyond the first loaded page.
6. Confirm year filters call backend filtering.
7. Confirm category filters call backend filtering.
8. Confirm Load More requests the next backend page.
9. Confirm `/news/` displays News archive articles only.
10. Confirm `/weather/` displays Weather archive articles only.
11. Confirm `/sports/` displays Sports archive articles only.
12. Confirm no city selector, bureau selector, or Bureaus Sheet dependency is present.
13. Confirm `/.github/workflows/manual-index-article-pages.yml` has `workflow_dispatch` only.
14. Confirm the builder does not mass-delete dated article directories.
15. Confirm `sitemap.xml`, `news-sitemap.xml`, and `robots.txt` remain valid.
16. Commit the surgical change.
17. Push to `main`.
18. Run the manual article-indexing workflow only when physical article routes need to be created or refreshed.

---

## 14. Acceptance Tests

The build is acceptable when:

- README shows `CGN Archives v1.1.0 Alpha` as the current archive build.
- README updated timestamp is `23 June 2026 • 04:21:58Z UTC`.
- Archive build stamp matches `2026-06-23T04:21:58Z`.
- Repository is `CookInternational/CGN-Archives`.
- Site is `https://archives.cgnnews.net`.
- Source of truth is the Archives Google Sheet.
- Spreadsheet ID is `10fc54JySFubbR1iGXsv_jDC-q9GY1dAgkYPln-L_Erk`.
- Sheet GID is `76333947`.
- Web App URL is documented.
- `/`, `/news/`, `/weather/`, and `/sports/` read current Sheet data automatically.
- Search uses backend query behavior.
- Year filters use backend query behavior.
- Category filters use backend query behavior.
- Load More uses backend pagination.
- Default page size remains 24.
- Manual indexing workflow is `/.github/workflows/manual-index-article-pages.yml`.
- Manual indexing workflow uses `workflow_dispatch` only.
- No scheduled indexing trigger exists.
- No repository dispatch indexing trigger exists.
- No push or pull-request indexing trigger exists.
- Builder does not mass-delete existing dated article directories.
- Physical indexed article routes are limited to News, Weather, and Sports route families.
- The archive has no active Cities or Bureaus archive system.
- The archive does not depend on a Bureaus Sheet.

---

## 15. File Inventory for v1.1.0 Alpha

| File or directory | Status |
|---|---|
| `README.md` | Canonical README / operating manual for CGN Archives. |
| `index.html` | Archive landing page and live archive discovery page. |
| `news/index.html` | News archive index page. |
| `weather/index.html` | Weather archive index page. |
| `sports/index.html` | Sports archive index page. |
| `404.html` | Archive article route fallback/runtime entry point. |
| `assets/` | Shared archive frontend assets and runtime files. |
| `scripts/` | Archive build/indexing support scripts where present. |
| `.github/workflows/manual-index-article-pages.yml` | Manual-only article indexing workflow. |
| `sitemap.xml` | Archive-domain sitemap. |
| `news-sitemap.xml` | Archive-domain news/article sitemap metadata. |
| `robots.txt` | Archive-domain crawler rules. |
| `site.webmanifest` | Archive-domain manifest metadata. |
| `CNAME` | Custom domain configuration for `archives.cgnnews.net`. |
| `favicon.ico` | Browser favicon. |
| `favicon-48x48.png` | Archive favicon asset. |
| `favicon-96x96.png` | Archive favicon asset. |
| `apple-touch-icon.png` | Archive Apple touch icon. |
| `android-chrome-192x192.png` | Archive Android icon. |
| `android-chrome-512x512.png` | Archive Android icon. |
| `CGNFavicon.png` | Legacy CGN favicon asset. |
| `CGNSportsCenterBanner01.png` | Sports archive banner asset. |
| `CGNSportsCenterBanner01.webp` | WebP sports archive banner asset. |

Legacy city or bureau-named directories are not part of the active archive system unless a separate approved change explicitly restores a static page for them.

---

## 16. Operator Notes

- Treat changes as surgical.
- Do not rewrite the whole archive to fix one archive page.
- Do not remove live Sheet behavior.
- Do not switch the source of truth to a static JSON file.
- Do not add a city selector.
- Do not add a bureau selector.
- Do not add `bureau=` filtering.
- Do not add bureau-prefixed routes.
- Do not restore a Bureaus Sheet dependency.
- Do not add scheduled article-indexing workflows.
- Do not make manual indexing run on push or pull request.
- Do not mass-delete existing dated article folders.
- Do not mix Weather or Sports rows into the News archive index.
- Do not remove Search, Year filters, Category filters, or Load More.
- Do not remove sitemap, news-sitemap, robots, favicon, manifest, or archive-domain metadata.
- Do not expose backend/dev/audit language on public archive pages.
- Keep the archive public website read-only.

---

## 17. Emergency Troubleshooting

### If the archive homepage does not show current data

Check the Apps Script Web App URL, `archive_live_index`, the Archives Sheet ID, the `Archives` tab, and Sheet GID `76333947`.

### If search misses older articles

Confirm the frontend sends `q` to the backend and that the backend searches the full Archives Sheet, not only the first browser-loaded page.

### If Load More repeats or stops early

Check `limit`, `offset`, and `next_offset` handling between the frontend and `archive_live_index`.

### If News archive shows Sports or Weather articles

Check `/news/index.html` and its category filter. News archive content should exclude Weather and Sports article rows.

### If Weather or Sports archive pages are empty

Check the fixed category filters for `/weather/` and `/sports/`, then confirm matching rows exist in the Archives Sheet.

### If indexed article pages 404

Run `/.github/workflows/manual-index-article-pages.yml` manually, then check that the dated route exists under `/news/`, `/weather/`, or `/sports/`.

### If a workflow runs automatically

Check `.github/workflows/manual-index-article-pages.yml` and remove any trigger other than `workflow_dispatch`.

### If city or bureau archive controls appear

Remove the selector/filter/route behavior. The archive has no active city or bureau archive system.

### If sitemap indexing looks stale

Check `sitemap.xml`, `news-sitemap.xml`, `robots.txt`, and the manual indexing workflow output.

---

Last Updated on 25 June 2026 • 19:43:00Z UTC | Developed by Cook Technology Services  
Copyright © 2026 | CGN News/Cook Global News Network. All Rights Reserved.  
End of README - CGN Archives v1.1.0 Alpha
