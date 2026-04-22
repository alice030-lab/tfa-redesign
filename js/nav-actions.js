/* nav-actions.js — 搜尋 / 購物車 / 登入 的輕量實作
   ─────────────────────────────────────────────
   設計原則：
   - 不依賴任何框架，單檔 vanilla JS
   - DOM 結構動態生成並 append 到 <body>
   - 用 [data-na-open="search|cart|login"] 或預設 selector 綁定觸發
   - ESC 關閉；焦點自動落到主要控制元件
*/
(() => {
  // ═══ 示範資料（真實串接會從 API 或 localStorage 取）═══
  const cartItems = [
    { id:"POS-001", name:"愛文芒果・2kg 禮盒", origin:"台南玉井", qty:1, price:680, img:"images/tfa/posesha-02.jpg" },
    { id:"HNY-003", name:"有機龍眼蜂蜜・500g", origin:"雲林古坑", qty:2, price:450, img:"images/tfa/honey-02.jpg" },
  ];

  // ═══ 工具：建立節點並注入 body ═══
  const html = (strings, ...values) => {
    const raw = strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
    const t = document.createElement("template");
    t.innerHTML = raw.trim();
    return t.content.firstElementChild;
  };

  const money = n => "NT$ " + n.toLocaleString("en-US");

  // ═══ 容器：單一 backdrop 共用 ═══
  const backdrop = html`<div class="na-backdrop" hidden></div>`;
  document.body.appendChild(backdrop);

  // ───── 搜尋 overlay ─────
  const searchEl = html`
    <div class="na-overlay na-search" hidden role="dialog" aria-label="搜尋商品與農友">
      <div class="na-search-inner">
        <label class="na-search-kicker">SEARCH</label>
        <div class="na-search-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-5-5"/></svg>
          <input type="search" placeholder="搜尋農友、商品、節氣…" autocomplete="off" spellcheck="false">
          <button class="na-close" aria-label="關閉">✕</button>
        </div>
        <div class="na-search-hints">
          <span class="na-search-hint-label">熱門：</span>
          <button data-q="愛文芒果">愛文芒果</button>
          <button data-q="花蓮富里米">花蓮富里米</button>
          <button data-q="阿里山烏龍">阿里山烏龍</button>
          <button data-q="有機蔬菜箱">有機蔬菜箱</button>
          <button data-q="節氣禮盒">節氣禮盒</button>
        </div>
        <div class="na-search-recent">
          <p class="na-search-sub">最近瀏覽</p>
          <ul>
            <li><a href="farmers.html">阿甘 · 波瑟沙植蓓農場</a></li>
            <li><a href="products.html">玉井愛文芒果禮盒</a></li>
            <li><a href="summer.html#xiazhi">夏至節氣選品</a></li>
          </ul>
        </div>
      </div>
    </div>`;
  document.body.appendChild(searchEl);

  // ───── 購物車 drawer ─────
  const cartEl = html`
    <aside class="na-drawer na-cart" hidden role="dialog" aria-label="購物車">
      <header class="na-drawer-head">
        <span>購物車 <em class="na-cart-count">0</em></span>
        <button class="na-close" aria-label="關閉">✕</button>
      </header>
      <ul class="na-cart-list"></ul>
      <footer class="na-drawer-foot">
        <div class="na-cart-total">
          <span>小計</span>
          <strong class="na-cart-sum">NT$ 0</strong>
        </div>
        <p class="na-cart-note">滿 NT$ 999 免運 · 下一單將自動帶入</p>
        <a href="#" class="na-cart-cta">前往結帳 →</a>
      </footer>
    </aside>`;
  document.body.appendChild(cartEl);

  // ───── 登入 modal ─────
  const loginEl = html`
    <div class="na-modal na-login" hidden role="dialog" aria-label="登入會員">
      <div class="na-modal-inner">
        <button class="na-close" aria-label="關閉">✕</button>
        <p class="na-login-kicker">Welcome back</p>
        <h3 class="na-login-h">登入你的<br>鮮農帳號</h3>
        <p class="na-login-sub">第一次來？<a href="#">加入會員</a></p>
        <form class="na-login-form" novalidate>
          <label>
            <span>Email</span>
            <input type="email" required placeholder="name@example.com" autocomplete="username">
          </label>
          <label>
            <span>密碼</span>
            <input type="password" required placeholder="至少 8 碼" autocomplete="current-password">
          </label>
          <div class="na-login-row">
            <label class="na-check"><input type="checkbox"> 記住我</label>
            <a href="#" class="na-login-forgot">忘記密碼？</a>
          </div>
          <button type="submit" class="na-login-submit">登入</button>
          <p class="na-login-or">— 或 —</p>
          <button type="button" class="na-login-alt">以 Google 登入</button>
        </form>
      </div>
    </div>`;
  document.body.appendChild(loginEl);

  // ═══ 開 / 關邏輯 ═══
  let openPanel = null;
  const lockBody = (on) => document.body.classList.toggle("na-locked", on);

  const close = () => {
    if(!openPanel) return;
    openPanel.hidden = true;
    openPanel.classList.remove("is-open");
    backdrop.hidden = true;
    backdrop.classList.remove("is-open");
    lockBody(false);
    openPanel = null;
  };

  const open = (el) => {
    if(openPanel && openPanel !== el) close();
    el.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      el.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    lockBody(true);
    openPanel = el;
    // focus first input/button inside
    const focusable = el.querySelector("input,button:not(.na-close),a[href]");
    focusable && focusable.focus({preventScroll:true});
  };

  // ESC + backdrop click
  document.addEventListener("keydown", e => { if(e.key === "Escape") close(); });
  backdrop.addEventListener("click", close);
  document.querySelectorAll(".na-close").forEach(b => b.addEventListener("click", close));

  // 觸發按鈕綁定：匹配 nav 的搜尋按鈕、購物車連結、登入連結
  const bindTriggers = () => {
    const nav = document.querySelector("nav.main .nav-actions");
    if(!nav) return;
    const searchBtn = nav.querySelector('button[aria-label="搜尋"]');
    const cartBtn = nav.querySelector(".cart-wrap");
    const loginBtn = Array.from(nav.querySelectorAll("a")).find(a => a.textContent.trim() === "登入");
    searchBtn && searchBtn.addEventListener("click", e => { e.preventDefault(); open(searchEl); });
    cartBtn   && cartBtn.addEventListener("click",   e => { e.preventDefault(); renderCart(); open(cartEl); });
    loginBtn  && loginBtn.addEventListener("click",  e => { e.preventDefault(); open(loginEl); });
  };

  // 搜尋 hint 點擊 → 帶入 input
  searchEl.querySelectorAll(".na-search-hints button").forEach(b => {
    b.addEventListener("click", () => {
      const input = searchEl.querySelector("input[type=search]");
      input.value = b.dataset.q;
      input.focus();
    });
  });
  // 搜尋送出 demo：目前只 console + 提示
  searchEl.querySelector("input[type=search]").addEventListener("keydown", e => {
    if(e.key === "Enter" && e.target.value.trim()){
      console.log("[search]", e.target.value);
      // 真實情境：location.href = "search.html?q=" + encodeURIComponent(...)
    }
  });

  // 購物車渲染
  const renderCart = () => {
    const list = cartEl.querySelector(".na-cart-list");
    const count = cartItems.reduce((s,i)=>s+i.qty,0);
    const sum = cartItems.reduce((s,i)=>s+i.price*i.qty,0);
    cartEl.querySelector(".na-cart-count").textContent = count;
    cartEl.querySelector(".na-cart-sum").textContent = money(sum);
    list.innerHTML = cartItems.map((it,idx)=>`
      <li class="na-cart-item" data-idx="${idx}">
        <div class="na-cart-img"><img src="${it.img}" alt="${it.name}" onerror="this.style.background='#e8e0d0';this.removeAttribute('src')"></div>
        <div class="na-cart-meta">
          <p class="na-cart-name">${it.name}</p>
          <p class="na-cart-origin">${it.origin}</p>
          <div class="na-cart-ctrl">
            <button class="na-qty" data-act="dec" aria-label="減少">−</button>
            <span class="na-qty-n">${it.qty}</span>
            <button class="na-qty" data-act="inc" aria-label="增加">+</button>
            <span class="na-cart-price">${money(it.price * it.qty)}</span>
            <button class="na-cart-del" data-act="del" aria-label="移除">移除</button>
          </div>
        </div>
      </li>`).join("");

    // bind qty controls
    list.querySelectorAll("[data-act]").forEach(btn => {
      btn.addEventListener("click", () => {
        const li = btn.closest("[data-idx]");
        const idx = +li.dataset.idx;
        const act = btn.dataset.act;
        if(act === "inc") cartItems[idx].qty += 1;
        else if(act === "dec") cartItems[idx].qty = Math.max(1, cartItems[idx].qty - 1);
        else if(act === "del") cartItems.splice(idx, 1);
        renderCart();
        syncCartBadge();
      });
    });
  };

  const syncCartBadge = () => {
    const count = cartItems.reduce((s,i)=>s+i.qty,0);
    const badge = document.querySelector("nav.main .cart-count");
    if(badge){
      if(count > 0){ badge.textContent = count; badge.hidden = false; }
      else { badge.hidden = true; }
    }
  };

  // 登入表單送出（demo）
  loginEl.querySelector(".na-login-form").addEventListener("submit", e => {
    e.preventDefault();
    const email = loginEl.querySelector("input[type=email]").value;
    if(!email) return;
    const submit = loginEl.querySelector(".na-login-submit");
    submit.textContent = "登入中…";
    submit.disabled = true;
    setTimeout(() => {
      submit.textContent = "✓ 歡迎回來 " + email.split("@")[0];
      setTimeout(close, 900);
      setTimeout(() => { submit.textContent = "登入"; submit.disabled = false; }, 1200);
    }, 700);
  });

  bindTriggers();
  syncCartBadge();
})();
