/* mobile-nav.js — 手機版漢堡抽屜
   ─────────────────────────────────────────────
   - 在 <1024px 時注入漢堡按鈕到 nav.main
   - 點擊開啟右側抽屜，內含主選單（折疊式 accordion）
   - 視覺語言：warm paper + 紙紋 overlay + 松綠／朱紅／金色強調
   - 與 nav-actions.js 的 .na-backdrop 共用一個遮罩
*/
(() => {
  const nav = document.querySelector("nav.main");
  if (!nav) return;
  const navInner = nav.querySelector(".nav-inner");
  const navActions = nav.querySelector(".nav-actions");
  const navLinks = nav.querySelector(".nav-links");
  if (!navInner || !navActions || !navLinks) return;

  // ── 1. 漢堡按鈕 ──
  const burger = document.createElement("button");
  burger.className = "mnav-burger";
  burger.type = "button";
  burger.setAttribute("aria-label", "開啟選單");
  burger.setAttribute("aria-expanded", "false");
  burger.innerHTML = `
    <span class="mnav-burger-lines" aria-hidden="true">
      <span></span><span></span><span></span>
    </span>
    <span class="mnav-burger-label">選單</span>
  `;
  // 放在 nav-actions 最右（搜尋/購物車之後）
  navActions.appendChild(burger);

  // ── 2. 抽屜（從 nav-links 的 mega-panel 轉 accordion）──
  const drawer = document.createElement("aside");
  drawer.className = "mnav-drawer";
  drawer.hidden = true;
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-label", "主選單");

  // 從主選單 clone 項目，轉成 accordion
  const items = Array.from(navLinks.children).map(li => {
    const topLink = li.querySelector(":scope > a");
    const mega = li.querySelector(":scope > .mega-panel");
    const href = topLink?.getAttribute("href") || "#";
    const label = topLink?.textContent.trim() || "";

    // 無子選單 → 直接連結
    if (!mega) {
      return `<div class="mnav-item mnav-item-solo">
        <a href="${href}" class="mnav-top-link">${label}</a>
      </div>`;
    }

    // 有子選單 → accordion
    const cols = Array.from(mega.querySelectorAll(".mega-col")).map(col => {
      const title = col.querySelector(".mega-col-title")?.textContent.trim() || "";
      const subSection = col.querySelector(".mega-col-title-sub");
      const uls = Array.from(col.querySelectorAll(":scope > ul"));
      const lists = uls.map((ul, idx) => {
        const head = idx === 0 ? title : (subSection?.textContent.trim() || "");
        const links = Array.from(ul.querySelectorAll(":scope > li")).map(subLi => {
          return `<li>${subLi.innerHTML}</li>`;
        }).join("");
        return `
          <div class="mnav-col">
            <p class="mnav-col-title">${head}</p>
            <ul class="mnav-sub-list">${links}</ul>
          </div>`;
      }).join("");
      return lists;
    }).join("");

    return `
      <div class="mnav-item" data-open="false">
        <button class="mnav-top" type="button" aria-expanded="false">
          <span class="mnav-top-label">${label}</span>
          <span class="mnav-top-caret" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="m4 6 4 4 4-4"/>
            </svg>
          </span>
        </button>
        <div class="mnav-panel">
          <div class="mnav-panel-inner">
            <a href="${href}" class="mnav-overview">瀏覽 ${label} →</a>
            ${cols}
          </div>
        </div>
      </div>`;
  }).join("");

  drawer.innerHTML = `
    <header class="mnav-head">
      <span class="mnav-kicker">MENU · 選單</span>
      <button class="mnav-close" type="button" aria-label="關閉">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </header>
    <div class="mnav-body">
      ${items}
    </div>
    <footer class="mnav-foot">
      <a href="#" class="mnav-foot-link" data-act="login">登入 / 註冊</a>
      <p class="mnav-foot-note">
        <span>台灣鮮農 Taiwan Freshness Agriculture</span>
        <span class="mnav-foot-seal">TFA · 2026</span>
      </p>
    </footer>
  `;
  document.body.appendChild(drawer);

  // ── 3. 共用遮罩（若 nav-actions.js 已建，重用；否則自建）──
  let backdrop = document.querySelector(".na-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "na-backdrop";
    backdrop.hidden = true;
    document.body.appendChild(backdrop);
  }

  // ── 4. 開關邏輯 ──
  const openDrawer = () => {
    drawer.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    burger.setAttribute("aria-expanded", "true");
    burger.classList.add("is-open");
    document.body.classList.add("na-locked");
  };
  const closeDrawer = () => {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.classList.remove("is-open");
    document.body.classList.remove("na-locked");
    setTimeout(() => {
      if (!drawer.classList.contains("is-open")) drawer.hidden = true;
      // 只在沒有其他 overlay 開啟時收起 backdrop
      const anyOpen = document.querySelector(".na-overlay.is-open, .na-drawer.is-open, .na-modal.is-open, .mnav-drawer.is-open");
      if (!anyOpen) backdrop.hidden = true;
    }, 280);
  };
  burger.addEventListener("click", () => {
    if (drawer.classList.contains("is-open")) closeDrawer();
    else openDrawer();
  });
  drawer.querySelector(".mnav-close").addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  // ── 5. Accordion：點 top 切換 ──
  drawer.querySelectorAll(".mnav-top").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".mnav-item");
      const open = item.dataset.open === "true";
      // 關其他
      drawer.querySelectorAll(".mnav-item[data-open='true']").forEach(el => {
        if (el !== item) {
          el.dataset.open = "false";
          el.querySelector(".mnav-top")?.setAttribute("aria-expanded", "false");
        }
      });
      item.dataset.open = open ? "false" : "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });

  // ── 6. 點抽屜裡的連結 → 關閉抽屜（讓頁面切換更順）──
  drawer.querySelectorAll("a[href]").forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#") && href.length > 1) {
        // 頁內錨點：關完再跳
        closeDrawer();
        return;
      }
      if (a.dataset.act === "login") {
        e.preventDefault();
        closeDrawer();
        // 延遲觸發 nav-actions 的登入
        setTimeout(() => {
          const loginBtn = document.querySelector('nav.main .nav-actions a[href="#"]');
          loginBtn?.click();
        }, 200);
        return;
      }
      // 其他外部/頁面連結交給瀏覽器，抽屜自然卸載
    });
  });

  // ── 7. 視窗放大到桌機時自動關閉 ──
  const mq = window.matchMedia("(min-width: 1024px)");
  const onChange = () => { if (mq.matches && drawer.classList.contains("is-open")) closeDrawer(); };
  mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
})();
