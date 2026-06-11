(function () {
  "use strict";

  const LANGS = [
    ["en", "English"], ["fr", "Français"], ["es", "Español"],
    ["de", "Deutsch"], ["it", "Italiano"], ["pt", "Português"],
    ["pt-br", "Português (Brasil)"], ["pl", "Polski"], ["ro", "Română"],
    ["nl", "Nederlands"], ["uk", "Українська"], ["zh-hant", "繁體中文"],
    ["zh-hans", "简体中文"], ["fil", "Filipino"], ["ceb", "Cebuano"],
    ["hi", "हिन्दी"], ["mr", "मराठी"]
  ];

  function languageButtons() {
    return LANGS.map(([value, label]) =>
      `<button type="button" class="archive-filter-chip" data-cgn-language-link="${value}">${label}</button>`
    ).join("");
  }

  function init() {
    if (document.getElementById("archive-filter-router")) return;
    const panel = document.querySelector(".archive-panel");
    const main = document.querySelector("main");
    if (!panel && !main) return;

    const wrap = document.createElement("section");
    wrap.id = "archive-filter-router";
    wrap.className = panel ? "archive-filter-controls" : "archive-filter-controls archive-filter-controls-standalone";
    wrap.setAttribute("aria-label", "Archive language controls");
    wrap.innerHTML = '<nav class="archive-filter-row archive-language-filters notranslate" translate="no" aria-label="Archive language controls">' + languageButtons() + '</nav>';

    if (panel) panel.parentNode.insertBefore(wrap, panel);
    else main.parentNode.insertBefore(wrap, main);

    if (window.CGNDynamicTranslate && typeof window.CGNDynamicTranslate.bindButtons === "function") {
      window.CGNDynamicTranslate.bindButtons();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
