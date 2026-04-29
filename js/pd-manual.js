/* pd-manual.js — 產品敘述圖片 lightbox
   ─────────────────────────────────────────────
   - 點 .pd-manual-stack img → 全螢幕看大圖
   - 上下鍵 / 左右鍵切換、ESC 關閉、點背景關閉
   - 純 vanilla JS，零依賴
*/
(() => {
  const stack = document.querySelector('.pd-manual-stack');
  if (!stack) return;
  const imgs = Array.from(stack.querySelectorAll('img'));
  if (!imgs.length) return;

  // ── 建 lightbox DOM ──
  const lb = document.createElement('div');
  lb.className = 'pd-manual-lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', '產品圖片放大檢視');
  lb.hidden = true;
  lb.innerHTML = `
    <button class="pd-manual-lightbox-close" type="button" aria-label="關閉">✕</button>
    <button class="pd-manual-lightbox-nav prev" type="button" aria-label="上一張">‹</button>
    <img alt="">
    <button class="pd-manual-lightbox-nav next" type="button" aria-label="下一張">›</button>
    <span class="pd-manual-lightbox-counter">1 / ${imgs.length}</span>
  `;
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('img');
  const lbCounter = lb.querySelector('.pd-manual-lightbox-counter');
  const btnClose = lb.querySelector('.pd-manual-lightbox-close');
  const btnPrev = lb.querySelector('.prev');
  const btnNext = lb.querySelector('.next');

  let current = 0;

  const show = (i) => {
    current = ((i % imgs.length) + imgs.length) % imgs.length;
    lbImg.src = imgs[current].src;
    lbImg.alt = imgs[current].alt || '';
    lbCounter.textContent = `${current + 1} / ${imgs.length}`;
  };

  const open = (i) => {
    show(i);
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { if (!lb.classList.contains('is-open')) lb.hidden = true; }, 320);
  };

  // 點縮圖開 lightbox
  imgs.forEach((img, i) => img.addEventListener('click', () => open(i)));

  // 控制
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
  btnNext.addEventListener('click', e => { e.stopPropagation(); show(current + 1); });

  // 點 lightbox 背景（不是按鈕、不是圖）→ 關閉
  lb.addEventListener('click', e => {
    if (e.target === lb || e.target === lbImg) close();
  });

  // 鍵盤
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });
})();
