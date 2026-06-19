(function () {
  "use strict";

  var DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbx41mQg-Ine3XZ-VrMI_SaQn4_K6cDQHA0cBFyGPgupu_edNFoNRjSLv2hoSe_bOytt/exec";
  var ARCHIVE_ORIGIN = "https://archives.cgnnews.net";
  var MAIN_SITE = "https://www.cgnnews.net";
  var SECTIONS = new Set(["news", "weather", "sports"]);

  function apiBase() {
    var meta = document.querySelector('meta[name="cgn-api-base"]');
    return String((meta && meta.getAttribute("content")) || DEFAULT_API_URL).trim().replace(/\?+$/, "");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character];
    });
  }

  function safeUrl(value, fallback) {
    var raw = String(value || "").trim();
    if (/^https?:\/\//i.test(raw) || raw.charAt(0) === "/") return raw.replace(/["'<>]/g, "");
    return fallback;
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "article";
  }

  function normalizedPath(pathname) {
    var value = String(pathname || "/").replace(/\/{2,}/g, "/");
    if (value.charAt(0) !== "/") value = "/" + value;
    if (value !== "/" && !value.endsWith("/")) value += "/";
    return value;
  }

  function parseArticlePath(pathname) {
    var parts = normalizedPath(pathname).split("/").filter(Boolean);
    if (parts.length !== 5) return null;
    if (!SECTIONS.has(parts[0].toLowerCase())) return null;
    if (!/^\d{4}$/.test(parts[1]) || !/^\d{2}$/.test(parts[2]) || !/^\d{2}$/.test(parts[3])) return null;
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(parts[4])) return null;
    return {
      section: parts[0].toLowerCase(),
      year: parts[1],
      month: parts[2],
      day: parts[3],
      slug: parts[4],
      path: normalizedPath(pathname)
    };
  }

  function articlePath(article) {
    var date = new Date(article.published_at || article.updated_at || "");
    if (Number.isNaN(date.getTime())) return "";
    var category = String(article.category || "").trim().toLowerCase();
    var section = category === "weather" ? "weather" : category === "sports" ? "sports" : "news";
    var year = String(date.getUTCFullYear());
    var month = String(date.getUTCMonth() + 1).padStart(2, "0");
    var day = String(date.getUTCDate()).padStart(2, "0");
    return normalizedPath("/" + section + "/" + year + "/" + month + "/" + day + "/" + slugify(article.slug || article.title) + "/");
  }

  function categorySlug(category) {
    var raw = String(category || "News").trim();
    var normalized = raw.toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9&]+/g, " ").replace(/\s+/g, " ").trim();
    var map = {
      "special reports": "special-reports",
      "cgn special report": "special-reports",
      "investigations": "investigations",
      "cgn investigates": "investigations",
      "religion spirituality": "religion-and-spirituality",
      "religion & spirituality": "religion-and-spirituality",
      "weather": "weather",
      "sports": "sports"
    };
    return map[normalized] || slugify(raw);
  }

  function authorSlug(author) {
    var clean = String(author || "CGN News Staff").trim() || "CGN News Staff";
    if (/^cgn\s+news(\s+staff)?$/i.test(clean)) return "cgn-news-staff";
    if (/^michael\s+a\.?\s+cook$/i.test(clean)) return "michael-a-cook";
    return slugify(clean);
  }

  function categoryLink(category) {
    var label = category || "News";
    return '<a class="archive-meta-link" href="' + escapeHtml(MAIN_SITE + "/category/" + categorySlug(label) + "/") + '">' + escapeHtml(label) + "</a>";
  }

  function authorLink(author) {
    var label = author || "CGN News Staff";
    return '<a class="archive-meta-link" href="' + escapeHtml(MAIN_SITE + "/reporters/" + authorSlug(label) + "/") + '">' + escapeHtml(label) + "</a>";
  }

  function visibleDate(raw) {
    var date = new Date(raw || "");
    if (Number.isNaN(date.getTime())) return "";
    var parts = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Indiana/Indianapolis",
      timeZoneName: "short"
    }).formatToParts(date);
    var values = {};
    parts.forEach(function (part) { values[part.type] = part.value; });
    var period = String(values.dayPeriod || "").toUpperCase();
    return values.day + " " + values.month + " " + values.year + " at " + values.hour + ":" + values.minute + (period ? " " + period : "") + (values.timeZoneName ? " " + values.timeZoneName : "");
  }

  function apiUrl(action, parameters) {
    var url = new URL(apiBase());
    url.searchParams.set("action", action);
    Object.keys(parameters || {}).forEach(function (key) {
      if (parameters[key] !== "" && parameters[key] != null) url.searchParams.set(key, parameters[key]);
    });
    return url.toString();
  }

  function loadJsonp(action, parameters) {
    return new Promise(function (resolve, reject) {
      var callbackName = "cgnArchiveArticle_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      var script = document.createElement("script");
      var url = new URL(apiBase());
      url.searchParams.set("action", action);
      Object.keys(parameters || {}).forEach(function (key) {
        if (parameters[key] !== "" && parameters[key] != null) url.searchParams.set(key, parameters[key]);
      });
      url.searchParams.set("callback", callbackName);

      function cleanup() {
        try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[callbackName] = function (data) {
        cleanup();
        resolve(data);
      };
      script.onerror = function () {
        cleanup();
        reject(new Error("Archive API JSONP request failed."));
      };
      script.src = url.toString();
      document.head.appendChild(script);
    });
  }

  async function loadApi(action, parameters) {
    try {
      var response = await fetch(apiUrl(action, parameters), {
        cache: "no-store",
        headers: { accept: "application/json" }
      });
      if (!response.ok) throw new Error("Archive API returned HTTP " + response.status + ".");
      return await response.json();
    } catch (error) {
      return loadJsonp(action, parameters);
    }
  }

  function renderArticle(mount, article, expectedPath) {
    var resolvedPath = articlePath(article);
    if (!resolvedPath || resolvedPath !== normalizedPath(expectedPath)) return false;

    var title = String(article.title || "Untitled archive article");
    var author = String(article.author || "CGN News Staff");
    var category = String(article.category || "News");
    var image = safeUrl(article.hero_image_url || article.image, "/news/CGNNewsDesk01.webp");
    var body = article.body_html || "<p>This archived article body is not available.</p>";
    var analysis = article.what_this_means || article.analysis || "";
    var published = visibleDate(article.published_at || article.updated_at);
    var modified = visibleDate(article.updated_at || article.published_at);
    var dateLine = [
      published ? "Published At: " + escapeHtml(published) : "",
      modified ? "Last Updated At: " + escapeHtml(modified) : ""
    ].filter(Boolean).join(" · ");

    mount.innerHTML =
      '<div class="archive-kicker">' + categoryLink(category) + "</div>" +
      "<h1>" + escapeHtml(title) + "</h1>" +
      (article.subtitle ? '<p class="archive-subtitle">' + escapeHtml(article.subtitle) + "</p>" : "") +
      '<div class="archive-meta">By ' + authorLink(author) + " · " + categoryLink(category) + (dateLine ? " · " + dateLine : "") + "</div>" +
      '<figure class="archive-hero-image"><img src="' + escapeHtml(image) + '" alt="' + escapeHtml(title) + '" decoding="async" onerror="this.onerror=null;this.src=\'/news/CGNNewsDesk01.webp\'"><figcaption>' + escapeHtml(article.image_credit || article.credit || "CGN News") + "</figcaption></figure>" +
      '<section class="archive-body">' + body + "</section>" +
      (analysis ? '<section class="archive-analysis"><h2>What this means</h2>' + analysis + "</section>" : "") +
      '<p class="archive-backlink"><a href="/">Back to CGN Archives</a></p>';

    document.title = String(article.seo_title || title) + " | CGN Archives";
    return true;
  }

  async function refresh() {
    var mount = document.getElementById("archiveArticle");
    if (!mount) return;
    var route = parseArticlePath(window.location.pathname);
    if (!route) return;

    try {
      var data = await loadApi("archive_live_article", {
        slug: route.slug,
        path: route.path,
        section: route.section
      });
      var article = data && data.article ? data.article : (data && data.title ? data : null);
      if (!article || data.success === false) return;
      renderArticle(mount, article, route.path);
    } catch (error) {
      console.warn("CGN Archives live article refresh failed; static indexed content remains visible.", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
}());
