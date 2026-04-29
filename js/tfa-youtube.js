/* tfa-youtube.js — Lite YouTube Embed
   ─────────────────────────────────────────────
   - 點擊縮圖才載入 iframe（首次互動才碰 YT 的 cookies / JS）
   - 全站事件委派：`.tfa-yt[data-id]` 自動綁定，無需單獨 init
   - 列表卡片 `.tfa-yt-card[data-id]` 預設外連到 youtube.com
   - 如要外連而非站內播放：`.tfa-yt[data-link="external"]`
   - Keyboard a11y：tab 可進入、Enter / Space 可觸發
*/
(() => {
  // 解析 YouTube 縮圖 fallback：maxres 不存在時退回 hq
  // 用 onerror 處理（HTML 已寫死也可，這邊掃一次補上）
  document.querySelectorAll('.tfa-yt-thumb, .tfa-yt-card-thumb img').forEach(img => {
    if (img.dataset.fallbackBound) return;
    img.dataset.fallbackBound = '1';
    img.addEventListener('error', () => {
      const m = img.src.match(/\/vi\/([A-Za-z0-9_-]{11})\/maxresdefault\.jpg/);
      if (m) img.src = `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
    }, { once: true });
  });

  function activate(yt) {
    if (yt.querySelector('iframe')) return; // 已啟動
    const id = yt.dataset.id;
    if (!id) return;

    if (yt.dataset.link === 'external') {
      window.open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener');
      return;
    }

    const ifr = document.createElement('iframe');
    ifr.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    ifr.title = yt.dataset.title || 'YouTube video player';
    ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    ifr.allowFullscreen = true;
    ifr.loading = 'lazy';
    yt.appendChild(ifr);

    // 收掉縮圖層
    yt.querySelector('.tfa-yt-thumb')?.remove();
    yt.querySelector('.tfa-yt-play')?.remove();
    yt.querySelector('.tfa-yt-caption')?.classList.add('is-playing');
    yt.classList.add('is-playing');
  }

  // 點擊：事件委派
  document.addEventListener('click', e => {
    const yt = e.target.closest('.tfa-yt');
    if (!yt) return;
    e.preventDefault();
    activate(yt);
  });

  // Keyboard a11y：Enter / Space
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const yt = e.target.closest && e.target.closest('.tfa-yt');
    if (!yt) return;
    if (e.target.tagName === 'BUTTON') return; // 讓按鈕自己 click
    e.preventDefault();
    activate(yt);
  });

  /* ── API：手動建立 ──
     用法：
       TFAYouTube.create({
         id: 'dQw4w9WgXcQ',
         title: '阿甘的龍眼蜜',
         caption: '採收實錄',
         link: 'inline'   // or 'external'
       })
     回傳一個 .tfa-yt 元素，你自己 append 到 DOM。
  */
  function create({ id, title = '', caption = '', link = 'inline' } = {}) {
    if (!id) throw new Error('TFAYouTube.create: id is required');
    const wrap = document.createElement('div');
    wrap.className = 'tfa-yt';
    wrap.dataset.id = id;
    if (title) wrap.dataset.title = title;
    if (link === 'external') wrap.dataset.link = 'external';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', `播放影片：${title || id}`);
    wrap.tabIndex = 0;
    wrap.innerHTML = `
      <img class="tfa-yt-thumb"
           src="https://img.youtube.com/vi/${id}/maxresdefault.jpg"
           alt="${(title || '').replace(/"/g,'&quot;')}"
           loading="lazy">
      <button class="tfa-yt-play" type="button" aria-label="播放">
        <svg viewBox="0 0 68 48" aria-hidden="true">
          <path d="M66.5 7.7c-.8-2.9-3-5.2-5.9-6C55.4.5 34 .5 34 .5S12.6.5 7.4 1.7c-2.9.8-5.1 3.1-5.9 6C.4 12.9.4 24 .4 24s0 11.1 1.1 16.3c.8 2.9 3 5.2 5.9 6 5.2 1.2 26.6 1.2 26.6 1.2s21.4 0 26.6-1.2c2.9-.8 5.1-3.1 5.9-6 1.1-5.2 1.1-16.3 1.1-16.3s0-11.1-1.1-16.3z" fill="#f00"/>
          <path d="M27 34V14l18 10z" fill="#fff"/>
        </svg>
      </button>
      ${caption ? `<span class="tfa-yt-caption">${caption}</span>` : ''}
    `;
    // 立即綁 fallback
    wrap.querySelector('.tfa-yt-thumb').addEventListener('error', e => {
      e.target.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }, { once: true });
    return wrap;
  }

  /* ── API：抽 video id ── */
  function extractId(url) {
    if (!url) return null;
    url = String(url).trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/i);
    return m ? m[1] : null;
  }

  window.TFAYouTube = { create, activate, extractId };
})();
