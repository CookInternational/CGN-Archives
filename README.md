# CGN Archives — Live Sheet, Manual Article Indexing

This repository serves `https://archives.cgnnews.net`.

## Source of truth

The public archive website reads the existing CGN Archives Google Sheet through the deployed Apps Script Web App. The website is read-only: it does not write to, edit, timestamp, publish, unpublish, or otherwise modify the Archives Sheet.

- Spreadsheet ID: `10fc54JySFubbR1iGXsv_jDC-q9GY1dAgkYPln-L_Erk`
- Sheet GID: `76333947`
- Web App URL: `https://script.google.com/macros/s/AKfycbx41mQg-Ine3XZ-VrMI_SaQn4_K6cDQHA0cBFyGPgupu_edNFoNRjSLv2hoSe_bOytt/exec`

## Automatic live behavior

These pages always read current Sheet data automatically and do not require a workflow run:

- `/`
- `/news/`
- `/weather/`
- `/sports/`
- Search
- Year and category filters
- 24-at-a-time Load More
- Existing indexed article bodies through the live article runtime

Ordinary repository updates continue publishing through the repository's existing GitHub Pages branch configuration.

## Manual-only article indexing

The only GitHub Actions workflow is:

`/.github/workflows/manual-index-article-pages.yml`

It has one trigger: `workflow_dispatch`.

The workflow manually creates or refreshes physical indexed article routes and indexing metadata for:

- `/news/YYYY/MM/DD/slug/`
- `/weather/YYYY/MM/DD/slug/`
- `/sports/YYYY/MM/DD/slug/`

It has no schedule, repository dispatch, push, pull-request, or chained automatic trigger. The builder does not mass-delete existing dated article directories.

## No Cities or Bureaus archive system

The archive has no city selector, bureau selector, `bureau=` filtering, bureau-prefixed routes, or Bureaus Sheet dependency. The global site shell remains unchanged.
