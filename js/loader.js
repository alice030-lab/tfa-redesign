/* loader.js — 稻穗生長 Loading 動畫
   ─────────────────────────────────────────────
   - 頁面載入時全螢幕遮罩 + 稻穗生長動畫
   - 最短展示時間 1100ms（讓動畫走完），頁面真 load 後才 fade out
   - 對外 API：
       window.TFALoader.show(hint?)     開啟（資料載入中）
       window.TFALoader.hide()          關閉
       window.TFALoader.wrap(promise, hint?)  包裝 Promise
   - 資料載入用時：maxMs=4500 防呆上限
*/
(() => {
  const MIN_MS = 1100;      // 最短展示時間（動畫週期）
  const MAX_MS = 6000;      // 防呆上限
  let shown = 0;            // 開啟計數（支援巢狀）
  let shownAt = 0;
  let hideTimer = null;

  const el = document.createElement("div");
  el.className = "tfa-loader";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `
    <div class="tfa-loader-stage">
      <svg class="tfa-loader-rice" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- 土壤基線 -->
        <path class="rice-soil" d="M20 218 Q100 210 180 218" fill="none" stroke="#8a6a3a" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
        <g class="rice-soil-dots">
          <circle cx="36"  cy="224" r="1.2"/>
          <circle cx="58"  cy="226" r="1"/>
          <circle cx="80"  cy="223" r="1.3"/>
          <circle cx="118" cy="225" r="1"/>
          <circle cx="144" cy="223" r="1.2"/>
          <circle cx="168" cy="226" r="1"/>
        </g>

        <!-- 主莖（畫線動畫）-->
        <path class="rice-stem" d="M100 218 Q98 170 102 130 Q106 92 100 55 Q96 34 100 20"
              fill="none" stroke="#5c7a3e" stroke-width="2.2" stroke-linecap="round"/>

        <!-- 葉片（左右各一對，sway）-->
        <g class="rice-leaves">
          <path class="leaf leaf-l1" d="M100 168 Q72 158 50 170 Q76 170 100 172 Z" fill="#6e9046"/>
          <path class="leaf leaf-r1" d="M101 148 Q128 136 152 148 Q126 152 101 152 Z" fill="#7ea051"/>
          <path class="leaf leaf-l2" d="M99 120 Q78 108 60 114 Q82 116 99 122 Z" fill="#82a555"/>
          <path class="leaf leaf-r2" d="M101 95 Q122 82 142 90 Q120 94 101 98 Z" fill="#8cb05c"/>
        </g>

        <!-- 稻穗穀粒（由下往上逐顆出現）-->
        <g class="rice-grains">
          <ellipse class="grain g1"  cx="96"  cy="78" rx="3.2" ry="5.5" fill="#e6b84a" transform="rotate(-18 96 78)"/>
          <ellipse class="grain g2"  cx="106" cy="72" rx="3.2" ry="5.5" fill="#e6b84a" transform="rotate(18 106 72)"/>
          <ellipse class="grain g3"  cx="93"  cy="63" rx="3.2" ry="5.5" fill="#e8bd54" transform="rotate(-22 93 63)"/>
          <ellipse class="grain g4"  cx="108" cy="56" rx="3.2" ry="5.5" fill="#e8bd54" transform="rotate(22 108 56)"/>
          <ellipse class="grain g5"  cx="92"  cy="47" rx="3"   ry="5.2" fill="#ecc362" transform="rotate(-24 92 47)"/>
          <ellipse class="grain g6"  cx="108" cy="40" rx="3"   ry="5.2" fill="#ecc362" transform="rotate(24 108 40)"/>
          <ellipse class="grain g7"  cx="96"  cy="32" rx="2.8" ry="4.8" fill="#f0ca70" transform="rotate(-20 96 32)"/>
          <ellipse class="grain g8"  cx="104" cy="26" rx="2.8" ry="4.8" fill="#f0ca70" transform="rotate(20 104 26)"/>
          <!-- 頂端芒尖 -->
          <path class="awn a1" d="M96 78  L88 62"  stroke="#c8a24a" stroke-width="1" fill="none" stroke-linecap="round"/>
          <path class="awn a2" d="M106 72 L114 56" stroke="#c8a24a" stroke-width="1" fill="none" stroke-linecap="round"/>
          <path class="awn a3" d="M93 63  L83 48"  stroke="#c8a24a" stroke-width="1" fill="none" stroke-linecap="round"/>
          <path class="awn a4" d="M108 56 L120 40" stroke="#c8a24a" stroke-width="1" fill="none" stroke-linecap="round"/>
          <path class="awn a5" d="M92 47  L83 32"  stroke="#c8a24a" stroke-width="1" fill="none" stroke-linecap="round"/>
          <path class="awn a6" d="M108 40 L119 24" stroke="#c8a24a" stroke-width="1" fill="none" stroke-linecap="round"/>
          <path class="awn a7" d="M96 32  L91 18"  stroke="#c8a24a" stroke-width="1" fill="none" stroke-linecap="round"/>
          <path class="awn a8" d="M104 26 L110 12" stroke="#c8a24a" stroke-width="1" fill="none" stroke-linecap="round"/>
        </g>
      </svg>
      <p class="tfa-loader-kicker">Growing · 載入中</p>
      <p class="tfa-loader-hint" data-role="hint">台灣鮮農 · 正在為你準備</p>
    </div>
  `;

  const setHint = (txt) => {
    const h = el.querySelector("[data-role=hint]");
    if (h && txt) h.textContent = txt;
  };

  const attach = () => {
    if (el.isConnected) return;
    // body 還沒解析出來時，直接掛到 <html> 上，搶在 body 之前蓋住畫面
    (document.body || document.documentElement).appendChild(el);
  };

  const lockScroll = (on) => {
    // body 若尚未解析，先鎖 documentElement
    const target = document.body || document.documentElement;
    target.classList.toggle("tfa-loader-lock", on);
    // body 出現後補鎖
    if (on && !document.body) {
      document.addEventListener("DOMContentLoaded",
        () => document.body.classList.add("tfa-loader-lock"), { once: true });
    }
  };

  const show = (hint) => {
    attach();
    shown++;
    if (hint) setHint(hint);
    if (shown === 1) {
      shownAt = performance.now();
      clearTimeout(hideTimer);
      el.hidden = false;
      // 立刻可見（不等 rAF，否則 head 階段 rAF 不一定會跑）
      el.classList.add("is-on");
      lockScroll(true);
    }
  };

  const hide = () => {
    shown = Math.max(0, shown - 1);
    if (shown > 0) return;
    const elapsed = performance.now() - shownAt;
    const wait = Math.max(0, MIN_MS - elapsed);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      el.classList.remove("is-on");
      lockScroll(false);
      setTimeout(() => { if (!el.classList.contains("is-on")) el.hidden = true; }, 420);
    }, wait);
  };

  const wrap = (promise, hint) => {
    show(hint);
    return Promise.resolve(promise).finally(hide);
  };

  // 初次進站：自動開啟，load 後關閉
  // （DOM 已存在時立刻注入並顯示，不等 DOMContentLoaded）
  const boot = () => {
    attach();
    show();
    // 防呆：不管 load 成不成功，最長 MAX_MS 強制關
    const maxTimer = setTimeout(() => hide(), MAX_MS);
    const done = () => { clearTimeout(maxTimer); hide(); };
    if (document.readyState === "complete") {
      // 已 load 完（例如快取）—— 讓動畫至少走滿 MIN_MS
      done();
    } else {
      window.addEventListener("load", done, { once: true });
    }
  };

  // 立即 boot —— 不等 DOMContentLoaded，才能在 <body> 還沒解析前就蓋住畫面
  boot();

  // 同站連結攔截：點下去立刻顯示 loader，讓「離開→進站」沒有白屏空窗
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return;                // 錨點略過
    if (href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;             // 外連不攔
      if (url.pathname === location.pathname && url.search === location.search) return;
      show();                                                  // 過場瞬間顯示
    } catch {}
  }, true);

  // bfcache 返回時，確保 loader 不會卡住畫面
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) { shown = 0; hide(); }
  });

  window.TFALoader = { show, hide, wrap };
})();
