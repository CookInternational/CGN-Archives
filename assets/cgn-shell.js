(function(){
  "use strict";
  // CGN News archive-safe shell | v8.3.0-Alpha | 2026-06-25T19:40:16Z UTC | Developed by Cook Technology Services
  // Archive subdomain rule: no Apps Script headline feed, no RSS feed, no live market ticker, no live market widget script.

  const MAIN = "https://www.cgnnews.net";
  const ARCHIVE = "https://archives.cgnnews.net";
  const LOGO = MAIN + "/CGNNewsLogo01.png";
  const SPORTS_ICON = MAIN + "/CGNSportsCenterIcon01.png";
  const IOS_PAGE = MAIN + "/ios/";

  function html(strings, ...values){ return strings.reduce((out, s, i) => out + s + (values[i] ?? ""), ""); }

  function formatCGNFooterLastUpdated(){
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone:"UTC",
      day:"2-digit",
      month:"long",
      year:"numeric",
      hour:"2-digit",
      minute:"2-digit",
      second:"2-digit",
      hourCycle:"h23"
    }).formatToParts(new Date());

    const map = {};
    parts.forEach(function(part){
      if(part.type !== "literal") map[part.type] = part.value;
    });

    return "Last Updated " + map.day + " " + map.month + " " + map.year + " at " + map.hour + ":" + map.minute + ":" + map.second + "Z";
  }

  function updateDateTime(){
    const el = document.getElementById("datetime");
    if(!el) return;
    const parts = new Intl.DateTimeFormat("en-US", {
      weekday:"long", day:"2-digit", month:"long", year:"numeric",
      hour:"numeric", minute:"2-digit", second:"2-digit", hour12:true,
      timeZone:"America/New_York", timeZoneName:"short"
    }).formatToParts(new Date());
    const map = {}; parts.forEach(p => map[p.type] = p.value);
    el.textContent = `${map.weekday}, ${map.day} ${map.month} ${map.year} | ${map.hour}:${map.minute}:${map.second} ${map.dayPeriod} ${map.timeZoneName || "ET"}`;
  }

  function toggleCategoryMenu(event){
    event.preventDefault(); event.stopPropagation();
    const menuWrap = event.currentTarget.closest(".nav-more");
    if(menuWrap) menuWrap.classList.toggle("open");
  }

  function supportHelpHtml(){
    return `<a href="${MAIN}/support/" class="cgn-help-link" aria-label="Open CGN Technical Support"><span class="cgn-help-mark" aria-hidden="true">?</span><span class="cgn-help-text">Help?</span></a>`;
  }

  function socialHtml(){
    return html`<a href="https://instagram.com/cookglobalnews" target="_blank" rel="noopener" aria-label="CGN News on Instagram"><svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm5 2.8A5.2 5.2 0 006.8 12 5.2 5.2 0 0012 17.2 5.2 5.2 0 0017.2 12 5.2 5.2 0 0012 6.8zm0 2A3.2 3.2 0 0115.2 12 3.2 3.2 0 0112 15.2 3.2 3.2 0 018.8 12 3.2 3.2 0 0112 8.8zm4.5-2.3a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/></svg></a>
    <a href="https://x.com/CookGlobalNews" target="_blank" rel="noopener" aria-label="CGN News on X"><svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2H21l-6.56 7.5L22 22h-6.828l-5.35-7.01L3.5 22H1l7.03-8.03L2 2h6.914l4.83 6.37L18.244 2zM17.15 20h1.52L7.03 4H5.4l11.75 16z"/></svg></a>
    <a href="https://youtube.com/@CookGlobalNews" target="_blank" rel="noopener" aria-label="CGN News on YouTube"><svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.016 3.016 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.016 3.016 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z"/></svg></a>`;
  }

  function iosAppHtml(){
    return html`<a id="cgn-ios-app-link" class="cgn-ios-app-link" href="${IOS_PAGE}" aria-label="Get the CGN NOW iOS app"><span class="cgn-ios-app-phone" aria-hidden="true"><span class="cgn-ios-app-notch"></span><span class="cgn-ios-app-word">iOS</span><span class="cgn-ios-app-home"></span></span><span class="cgn-ios-app-text">Get the iOS App</span></a>`;
  }

  function renderHeader(){
    const mount = document.getElementById("cgn-site-header"); if(!mount) return;
    mount.innerHTML = html`<header class="top-bar">
      <a href="${MAIN}/" class="brand-link" aria-label="CGN News homepage"><img src="${LOGO}" class="logo" alt="CGN News"><span class="network-name">Cook Global News Network</span></a>
      <nav class="nav" aria-label="Main Navigation">
        <a href="${MAIN}/category/world/">World</a><a href="${MAIN}/category/politics/">Politics</a><a href="${MAIN}/category/business/">Business</a><a href="${MAIN}/category/markets/">Markets</a><a href="${MAIN}/category/technology/">Technology</a>
        <span class="nav-more"><button class="nav-more-button" type="button" aria-label="More CGN News categories" aria-haspopup="true">▾</button><span id="category-dropdown" class="nav-dropdown" role="menu"><a href="${MAIN}/category/entertainment/">Entertainment</a><a href="${MAIN}/category/environment/">Environment</a><a href="${MAIN}/category/energy/">Energy</a><a href="${MAIN}/category/opinion/">Opinion</a><a href="${MAIN}/category/local/">Local</a><a href="${MAIN}/category/investigations/">Investigations</a><a href="${MAIN}/category/special-reports/">Special Reports</a><a href="${MAIN}/category/religion-and-spirituality/">Religion &amp; Spirituality</a><a href="${MAIN}/news/">View All News</a></span></span>
      </nav>
      <div class="right-tools"><a id="account-btn" href="${MAIN}/account/">Account</a><div id="datetime"></div><a id="weather" href="${MAIN}/weather/">Weather</a><a class="archive-pill" href="${ARCHIVE}/">Archives</a><a id="news-directory-link" class="news-directory-link" href="${MAIN}/news/" aria-label="CGN News directory"><span class="news-directory-icon" aria-hidden="true"><span class="news-directory-word">NEWS</span><span class="news-directory-paper"><span class="news-directory-line news-directory-line-wide"></span><span class="news-directory-line"></span><span class="news-directory-line"></span><span class="news-directory-box"></span></span></span></a><a id="sports-center-link" class="sports-center-link" href="${MAIN}/sports/" aria-label="CGN Sports Center"><img src="${SPORTS_ICON}" class="sports-center-icon" alt=""><span class="sports-center-text">Sports</span></a>${supportHelpHtml()}${socialHtml()}${iosAppHtml()}<a href="${MAIN}/editor/" class="editor-portal-link" aria-label="Open CGN Editor Portal"><span class="editor-portal-pen" aria-hidden="true"></span><span class="editor-portal-text">EDITOR LOGIN</span></a></div>
    </header>`;
    const moreBtn = mount.querySelector(".nav-more-button"); if(moreBtn) moreBtn.addEventListener("click", toggleCategoryMenu);
    updateDateTime(); setInterval(updateDateTime, 1000);
  }

  function renderFooter(){
    const mount = document.getElementById("cgn-site-footer"); if(!mount) return;
    mount.innerHTML = html`<footer class="footer"><div class="footer-container">
      <div><a href="${MAIN}/"><img src="${LOGO}" class="footer-logo" alt="CGN News"></a><p>Real-Time News.<br>Global Perspective.</p></div>
      <div><h4><a href="${MAIN}/news/">News</a></h4><a href="${MAIN}/category/world/">World</a><br><a href="${MAIN}/category/politics/">Politics</a><br><a href="${MAIN}/category/business/">Business</a><br><a href="${MAIN}/category/markets/">Markets</a><br><a href="${MAIN}/category/technology/">Technology</a><br><a href="${MAIN}/category/investigations/">Investigations</a><br><a href="${MAIN}/weather/">Weather</a><br><a href="${MAIN}/category/religion-and-spirituality/">Religion &amp; Spirituality</a></div>
      <div class="footer-link-column"><h4><a href="${MAIN}/reporters/">Reporters</a></h4><a href="${MAIN}/category/special-reports/">Special Reports</a><br><a href="${MAIN}/category/entertainment/">Entertainment</a><br><a href="${MAIN}/category/environment/">Environment</a><br><a href="${MAIN}/category/energy/">Energy</a><br><a href="${MAIN}/category/opinion/">Opinion</a><br><a href="${MAIN}/category/local/">Local</a><br><a href="${MAIN}/sports/">Sports</a><br><a href="${ARCHIVE}/" class="footer-legal-archives">Full Archives</a></div>
      <div class="footer-legal-links"><h4><a href="${MAIN}/editorial-standards/">Editorial Standards</a></h4><a href="${MAIN}/about">About Us</a><br><a href="${MAIN}/contact">Contact Us</a><br><a href="${MAIN}/terms-of-service">Terms of Service</a><br><a href="${MAIN}/privacy-policy">Privacy Policy</a><br><a href="mailto:tips@cgnnews.net?subject=RE%3A%20Tip">Submit a Tip</a><br><a href="${MAIN}/write-for-us/">Write For Us</a><br><a href="${MAIN}/advertise/">Advertise With Us</a><br><a href="${MAIN}/copyright/">Copyright</a><br></div>
      <div class="footer-bureau"><h4><a href="${MAIN}/bureaus/">Bureaus</a></h4><p class="footer-bureau-name">Cook Global News Network</p><p>151 N. Delaware Street, Suite 122<br>Indianapolis, IN 46204</p><p><a href="mailto:tips@cgnnews.net">tips@cgnnews.net</a><br>+1 (317) 442-1437</p><div class="footer-social">${socialHtml()}</div></div>
    </div><div class="footer-eo-block" aria-label="Equal Opportunity Employer notice"><p class="footer-eo-title"><a href="${MAIN}/equal-opportunity">EQUAL OPPORTUNITY EMPLOYER</a></p><div class="footer-eo-copy"><p class="footer-eo-policy">CGN News is an equal opportunity employer, and does not discriminate on the basis of race, sex, religion, color, national origin, gender identity, pregnancy status, disability status, veteran status or any other protected category as defined by law.</p></div><p class="footer-veteran-owned">VETERAN OWNED BUSINESS</p></div><div class="footer-utility-links"><p><a href="${MAIN}/unsubscribe/">Unsubscribe From Newsletter</a></p></div><div class="footer-bottom"><a href="${MAIN}/copyright/">Copyright © 2026 | CGN News — All Rights Reserved</a><span> | ${formatCGNFooterLastUpdated()}</span></div></footer>`;
  }

  function injectStyles(){
    if(document.getElementById("cgn-shell-styles")) return;
    const style = document.createElement("style");
    style.id = "cgn-shell-styles";
    style.textContent = `
      .logo{height:95px}.top-bar{display:flex;justify-content:space-between;align-items:center;padding:10px 20px;border-bottom:1px solid #ddd;gap:20px;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}.brand-link{display:flex;flex-direction:column;align-items:center;text-decoration:none;color:#111;line-height:1;flex-shrink:0}.network-name{margin-top:3px;font-family:Arial Black,Arial,Helvetica,sans-serif;font-weight:900;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#111;white-space:nowrap}.nav{display:flex;gap:20px;font-weight:600;align-items:center;white-space:nowrap}.nav a{text-decoration:none;color:#111;font-size:14px}.nav a:hover{text-decoration:underline}.nav-more{position:relative;display:inline-flex;align-items:center}.nav-more-button{border:0;background:transparent;color:#111;cursor:pointer;font-weight:800;font-size:14px;padding:4px 0 4px 2px;line-height:1}.nav-dropdown{display:none;position:absolute;top:100%;right:0;min-width:190px;background:#fff;border:1px solid #ddd;box-shadow:0 12px 30px rgba(0,0,0,.12);z-index:50;padding:8px 0}.nav-more:hover .nav-dropdown,.nav-more:focus-within .nav-dropdown,.nav-more.open .nav-dropdown{display:block}.nav-dropdown a{display:block;padding:9px 14px;color:#111;text-decoration:none;font-size:13px;white-space:nowrap}.nav-dropdown a:hover{background:#f4f4f4;text-decoration:none}.right-tools{display:flex;gap:15px;align-items:center;font-size:13px;white-space:nowrap}#account-btn,.archive-pill{display:inline-flex;align-items:center;justify-content:center;padding:7px 12px;border:1px solid #111;border-radius:999px;color:#111;text-decoration:none;font-weight:700;line-height:1;background:#fff}#account-btn:hover,.archive-pill:hover{background:#111;color:#fff;text-decoration:none}#weather{text-decoration:none;color:#111;font-weight:600}.social-icon{width:20px;height:20px;fill:#111;display:block;transition:opacity .2s ease}.social-icon:hover{opacity:.65}.cgn-ios-app-link{width:26px;height:36px;display:inline-flex;align-items:center;justify-content:center;color:#111;text-decoration:none;flex:0 0 auto;transition:opacity .2s ease}.cgn-ios-app-link:hover{opacity:.72;text-decoration:none}.cgn-ios-app-phone{position:relative;display:inline-flex;align-items:center;justify-content:center;width:23px;height:32px;flex:0 0 23px;border:2px solid #111;border-radius:7px;background:radial-gradient(circle at 50% 42%,rgba(83,213,255,.18),transparent 46%),linear-gradient(180deg,rgba(7,17,31,.06),rgba(7,17,31,.02));box-shadow:inset 0 0 0 1px rgba(7,17,31,.10)}.cgn-ios-app-notch{position:absolute;top:3px;left:50%;width:9px;height:2px;border-radius:999px;background:#111;transform:translateX(-50%)}.cgn-ios-app-word{display:block;margin-top:1px;color:#111;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:7px;font-weight:900;line-height:1;letter-spacing:-.02em}.cgn-ios-app-home{position:absolute;bottom:3px;left:50%;width:4px;height:4px;border-radius:999px;background:#c40000;transform:translateX(-50%);box-shadow:0 0 0 1px rgba(7,17,31,.42)}.cgn-ios-app-text{display:none}.editor-portal-link{width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;position:relative;color:#111;text-decoration:none;transition:opacity .2s ease}.editor-portal-text{display:none}.editor-portal-pen{width:17px;height:4px;background:#111;border-radius:999px;transform:rotate(-38deg);position:relative;display:block}.editor-portal-pen::before{content:"";position:absolute;left:-5px;top:0;width:0;height:0;border-top:2px solid transparent;border-bottom:2px solid transparent;border-right:6px solid #111}.editor-portal-pen::after{content:"";position:absolute;right:-4px;top:0;width:4px;height:4px;background:#111;border-radius:1px}.cgn-help-link{width:24px;height:24px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;color:#111;text-decoration:none;line-height:1;flex:0 0 auto}.cgn-help-mark{width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center;border:2px solid #111;border-radius:999px;background:#fff;color:#111;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:10px;font-weight:900;line-height:1}.cgn-help-text{display:block;margin-top:1px;color:#111;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:6px;font-weight:900;line-height:1;white-space:nowrap}.news-directory-link,.sports-center-link{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;color:#111}.news-directory-icon{width:28px;height:28px;display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;position:relative;line-height:1}.news-directory-word{display:block;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:7px;font-weight:900;color:#111;line-height:1;margin:0 0 1px}.news-directory-paper{width:22px;height:19px;border:2px solid #111;border-radius:2px;display:block;position:relative;box-sizing:border-box}.news-directory-line{display:block;width:10px;height:2px;background:#111;margin:3px 0 0 3px}.news-directory-line-wide{width:14px}.news-directory-box{position:absolute;right:3px;bottom:3px;width:5px;height:5px;border:1px solid #111}.sports-center-icon{width:28px;height:28px;object-fit:contain}.sports-center-text{display:none}.footer{background:#07172f;color:#fff;font-family:Arial,Helvetica,sans-serif;padding:36px 20px 22px;margin-top:40px}.footer a{color:#fff;text-decoration:none}.footer a:hover{text-decoration:underline}.footer-container{display:grid;grid-template-columns:1.1fr repeat(4,1fr);gap:28px;max-width:1180px;margin:0 auto}.footer h4{margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:.08em}.footer p{color:#d9e6fa;line-height:1.45;margin:8px 0}.footer-logo{height:78px;background:#fff;border-radius:8px;padding:4px}.footer-social{display:flex;gap:12px;margin-top:10px}.footer-social .social-icon{fill:#fff}.footer-eo-block{max-width:1180px;margin:28px auto 0;padding-top:20px;border-top:1px solid rgba(255,255,255,.22);text-align:center}.footer-eo-title{font-weight:900;letter-spacing:.06em}.footer-eo-copy{max-width:950px;margin:0 auto;text-align:center;font-size:12px}.footer-veteran-owned{font-weight:900;color:#fff}.footer-utility-links,.footer-bottom{text-align:center;margin-top:18px;color:#d9e6fa;font-size:13px}@media(max-width:1100px){.top-bar{flex-wrap:wrap;justify-content:center}.nav{order:3;flex-wrap:wrap;justify-content:center}.right-tools{order:2;flex-wrap:wrap;justify-content:center}}@media(max-width:760px){.logo{height:76px}.top-bar{padding:10px 12px;gap:12px}.nav{gap:12px}.nav a{font-size:13px}.network-name{font-size:9px}.nav-dropdown{left:50%;right:auto;transform:translateX(-50%);width:min(260px,calc(100vw - 32px));max-width:calc(100vw - 32px)}.right-tools{width:100%;max-width:390px;margin:0 auto;gap:10px 12px}#datetime{flex:0 0 100%;width:100%;text-align:center;line-height:1.25}.cgn-ios-app-link{width:auto;min-height:30px;padding:5px 10px;gap:8px;border:1px solid #111;border-radius:999px;background:#fff;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:10px;font-weight:900;letter-spacing:.04em;line-height:1}.cgn-ios-app-text{display:inline-block;color:#111;white-space:nowrap}.cgn-ios-app-phone{width:20px;height:28px;flex-basis:20px}.editor-portal-link{width:auto;min-height:30px;padding:5px 10px;gap:8px;border:1px solid #111;border-radius:999px;background:#fff;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:10px;font-weight:900;letter-spacing:.04em;line-height:1}.editor-portal-text{display:inline-block;white-space:nowrap}.footer-container{grid-template-columns:1fr;text-align:center}.footer-social{justify-content:center}.footer-eo-copy{text-align:center}}
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("click", function(event){
    const navMore = document.querySelector(".nav-more");
    if(navMore && !navMore.contains(event.target)) navMore.classList.remove("open");
  });
  document.addEventListener("keydown", function(event){ if(event.key === "Escape"){ const navMore=document.querySelector(".nav-more"); if(navMore) navMore.classList.remove("open"); } });
  function initShell(){ injectStyles(); renderHeader(); renderFooter(); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initShell); else initShell();
})();
