/* Generate pantry.html and gift.html from fresh.html template
   One-shot, run once and delete. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const fresh = fs.readFileSync(path.join(ROOT, 'fresh.html'), 'utf8');

// ═══ pantry.html ═══
let pantry = fresh
  .replace('<title>當季鮮食 — 台灣鮮農</title>', '<title>廚房常備 — 台灣鮮農</title>')
  .replace(
    '蔬菜、水果、肉品、海鮮、蛋品米麵——當天從產地直送的台灣鮮味。台灣鮮農的當季鮮食總覽。',
    '料理即食、油品調味、南北貨、乳品零食、飲品茶水——廚房裡最值得常備的台灣味。'
  )
  .replace('<li class="current">當季鮮食</li>', '<li class="current">廚房常備</li>')
  .replace(
    '<span class="hub-hero-icn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V10"/><path d="M12 10c-3 0-5-2-5-5 3 0 5 2 5 5z"/><path d="M12 10c3 0 5-2 5-5-3 0-5 2-5 5z"/></svg></span>',
    '<span class="hub-hero-icn"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="12" height="3"/><path d="M5 6h14l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M9 11h6M9 15h6"/></svg></span>'
  )
  .replace('<span class="hub-kicker">Fresh · 當季鮮食</span>', '<span class="hub-kicker">Pantry · 廚房常備</span>')
  .replace(
    '<h1 class="hub-h1">從產地直送的當天，<br>是最短的距離</h1>',
    '<h1 class="hub-h1">廚房裡最值得常備的，<br>都是台灣味</h1>'
  )
  .replace(
    '<p class="hub-lead">蔬菜、水果、肉品、海鮮、蛋品米麵——產地凌晨採收、當天裝箱、48 小時內到你家。我們連結 200+ 認證農友，每件都看得到名字。</p>',
    '<p class="hub-lead">料理即食、油品調味、南北貨、乳品零食、飲品茶水——下廚 5 分鐘有靈魂。台灣鮮農精選農友自製常備品，省事不省心。</p>'
  )
  .replace('<div><strong>238</strong>項商品</div>', '<div><strong>184</strong>項商品</div>')
  .replace('<div><strong>48hr</strong>到家</div>', '<div><strong>常溫</strong>長效保存</div>')
  .replace('aria-label="當季鮮食分類"', 'aria-label="廚房常備分類"');

// 替換 5 個 tabs
const pantryTabs = `<button type="button" class="hub-tab active" data-tab="ready" role="tab" aria-selected="true">
        <span class="icn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11h18l-2 9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/></svg></span>
        料理即食<span class="count">42</span>
      </button>
      <button type="button" class="hub-tab" data-tab="oil" role="tab" aria-selected="false">
        <span class="icn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6v6l-2 2v8a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-8L9 9z"/></svg></span>
        油品調味<span class="count">36</span>
      </button>
      <button type="button" class="hub-tab" data-tab="dry" role="tab" aria-selected="false">
        <span class="icn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M5 7v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7"/><path d="M9 13h6"/></svg></span>
        南北貨<span class="count">38</span>
      </button>
      <button type="button" class="hub-tab" data-tab="dairy" role="tab" aria-selected="false">
        <span class="icn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8l-1 4 2 4v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8l2-4z"/></svg></span>
        乳品零食<span class="count">38</span>
      </button>
      <button type="button" class="hub-tab" data-tab="drinks" role="tab" aria-selected="false">
        <span class="icn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h13v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M18 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/></svg></span>
        飲品茶水<span class="count">26</span>
      </button>`;

pantry = pantry.replace(
  /<button type="button" class="hub-tab active" data-tab="veg"[\s\S]*?蛋品米麵<span class="count">38<\/span>\s*<\/button>/,
  pantryTabs
);

// 替換 TAB_INFO
pantry = pantry.replace(
  /const TAB_INFO = \{[\s\S]*?\};/,
  `const TAB_INFO = {
    ready:  { name:'料理即食', count:42 },
    oil:    { name:'油品調味', count:36 },
    dry:    { name:'南北貨',   count:38 },
    dairy:  { name:'乳品零食', count:38 },
    drinks: { name:'飲品茶水', count:26 },
  };`
);
pantry = pantry.replace("const initial = params.get('cat') || 'veg';", "const initial = params.get('cat') || 'ready';");
pantry = pantry.replace("if (!TAB_INFO[key]) key = 'veg';", "if (!TAB_INFO[key]) key = 'ready';");
pantry = pantry.replace('<strong id="hub-count">62</strong>', '<strong id="hub-count">42</strong>');
pantry = pantry.replace('<span id="hub-cat-name">蔬菜</span>', '<span id="hub-cat-name">料理即食</span>');

// 替換 panels (以 <!-- 蔬菜 --> 為起點到 <!-- ═══ FOOTER 之前)
const pantryPanels = `<!-- 料理即食 -->
    <div class="hub-panel is-active" data-panel="ready" role="tabpanel">
      <div class="hub-grid">
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-01.jpg" alt="老菜脯雞湯"></div><div class="product-body"><span class="product-brand">好呷覓</span><h3 class="product-name">老菜脯雞湯</h3><span class="product-spec">7 包組 · 每包 500g</span><div class="product-price">NT$ 1,000</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-02.jpg" alt="麻油雞"></div><div class="product-body"><span class="product-brand">好呷覓</span><h3 class="product-name">原汁麻油雞</h3><span class="product-spec">3 包組 · 每包 600g</span><div class="product-price">NT$ 720</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-03.jpg" alt="當歸羊肉拉麵"></div><div class="product-body"><span class="product-brand">豐園羊牧場</span><h3 class="product-name">當歸羊肉拉麵</h3><span class="product-spec">4 包組 · 每包 350g</span><div class="product-price">NT$ 880</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-01.jpg" alt="人蔘雞湯"></div><div class="product-body"><span class="product-brand">山地雞家</span><h3 class="product-name">人蔘雞湯包</h3><span class="product-spec">3 包組</span><div class="product-price">NT$ 660</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-02.jpg" alt="酸菜白肉鍋"></div><div class="product-body"><span class="product-brand">滿州大廚</span><h3 class="product-name">酸菜白肉鍋</h3><span class="product-spec">2 人份 · 1.5kg</span><div class="product-price">NT$ 580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-03.jpg" alt="紅燒牛肉麵"></div><div class="product-body"><span class="product-brand">老街牛肉麵</span><h3 class="product-name">紅燒牛肉麵</h3><span class="product-spec">2 人份 · 2.5kg</span><div class="product-price">NT$ 720</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-04.jpg" alt="花膠雞湯"></div><div class="product-body"><span class="product-brand">海味食堂</span><h3 class="product-name">花膠竹笙雞湯</h3><span class="product-spec">2 包組 · 每包 800g</span><div class="product-price">NT$ 980</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-01.jpg" alt="冷凍水餃"></div><div class="product-body"><span class="product-brand">餡餅之家</span><h3 class="product-name">手工高麗菜豬肉水餃</h3><span class="product-spec">50 顆 / 盒</span><div class="product-price">NT$ 380</div></div></a>
      </div>
      <div class="hub-loadmore"><button type="button">載入更多 · 還有 34 項</button></div>
    </div>

    <!-- 油品調味 -->
    <div class="hub-panel" data-panel="oil" role="tabpanel" hidden>
      <div class="hub-grid">
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-02.jpg" alt="冷壓胡麻油"></div><div class="product-body"><span class="product-brand">胡麻先生</span><h3 class="product-name">冷壓黑胡麻油</h3><span class="product-spec">500ml × 2 瓶</span><div class="product-price">NT$ 1,280</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-03.jpg" alt="苦茶油"></div><div class="product-body"><span class="product-brand">老欉苦茶</span><h3 class="product-name">頂級苦茶油</h3><span class="product-spec">500ml</span><div class="product-price">NT$ 980</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-04.jpg" alt="蜂蜜醋"></div><div class="product-body"><span class="product-brand">情人蜂蜜</span><h3 class="product-name">一番搾蜂蜜酢</h3><span class="product-spec">350ml · 飲用醋</span><div class="product-price">NT$ 350</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-01.jpg" alt="醬油"></div><div class="product-body"><span class="product-brand">手工釀造</span><h3 class="product-name">純黑豆釀造醬油</h3><span class="product-spec">450ml × 2 瓶</span><div class="product-price">NT$ 580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-02.jpg" alt="海鹽"></div><div class="product-body"><span class="product-brand">台南七股</span><h3 class="product-name">日曬海鹽</h3><span class="product-spec">300g × 3 罐</span><div class="product-price">NT$ 380</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-03.jpg" alt="味噌"></div><div class="product-body"><span class="product-brand">日式工坊</span><h3 class="product-name">古法白味噌</h3><span class="product-spec">500g</span><div class="product-price">NT$ 320</div></div></a>
      </div>
      <div class="hub-loadmore"><button type="button">載入更多 · 還有 30 項</button></div>
    </div>

    <!-- 南北貨 -->
    <div class="hub-panel" data-panel="dry" role="tabpanel" hidden>
      <div class="hub-grid">
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-01.jpg" alt="香菇"></div><div class="product-body"><span class="product-brand">埔里香菇</span><h3 class="product-name">埔里乾香菇禮盒</h3><span class="product-spec">300g</span><div class="product-price">NT$ 580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-02.jpg" alt="紅棗"></div><div class="product-body"><span class="product-brand">公館紅棗</span><h3 class="product-name">公館紅棗</h3><span class="product-spec">600g</span><div class="product-price">NT$ 480</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-03.jpg" alt="干貝"></div><div class="product-body"><span class="product-brand">日本進口</span><h3 class="product-name">北海道頂級干貝</h3><span class="product-spec">200g</span><div class="product-price">NT$ 1,580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-04.jpg" alt="桂圓"></div><div class="product-body"><span class="product-brand">古坑龍眼</span><h3 class="product-name">手工桂圓乾</h3><span class="product-spec">450g</span><div class="product-price">NT$ 380</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-01.jpg" alt="木耳"></div><div class="product-body"><span class="product-brand">埔里黑木耳</span><h3 class="product-name">純素白木耳露</h3><span class="product-spec">300ml × 6 瓶</span><div class="product-price">NT$ 480</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-02.jpg" alt="蓮子"></div><div class="product-body"><span class="product-brand">白河蓮子</span><h3 class="product-name">白河手剝蓮子</h3><span class="product-spec">300g</span><div class="product-price">NT$ 480</div></div></a>
      </div>
      <div class="hub-loadmore"><button type="button">載入更多 · 還有 32 項</button></div>
    </div>

    <!-- 乳品零食 -->
    <div class="hub-panel" data-panel="dairy" role="tabpanel" hidden>
      <div class="hub-grid">
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/fengyuan-01.jpg" alt="鮮羊乳"></div><div class="product-body"><span class="product-brand">豐園羊牧場</span><h3 class="product-name">純鮮羊乳</h3><span class="product-spec">200ml × 12 瓶</span><div class="product-price">NT$ 720</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/fengyuan-02.jpg" alt="優格"></div><div class="product-body"><span class="product-brand">豐園羊牧場</span><h3 class="product-name">手作希臘羊優格</h3><span class="product-spec">200g × 6 杯</span><div class="product-price">NT$ 580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-01.jpg" alt="蜂蜜餅乾"></div><div class="product-body"><span class="product-brand">情人蜂蜜</span><h3 class="product-name">蜂蜜柚子餅乾</h3><span class="product-spec">200g × 3 包</span><div class="product-price">NT$ 380</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-02.jpg" alt="水果乾"></div><div class="product-body"><span class="product-brand">玉井合作社</span><h3 class="product-name">綜合水果乾</h3><span class="product-spec">200g × 4 包</span><div class="product-price">NT$ 580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-03.jpg" alt="芋頭酥"></div><div class="product-body"><span class="product-brand">大甲芋頭</span><h3 class="product-name">芋頭酥禮盒</h3><span class="product-spec">12 入</span><div class="product-price">NT$ 480</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-04.jpg" alt="黑豆奶"></div><div class="product-body"><span class="product-brand">埔里黑豆</span><h3 class="product-name">純素黑豆奶</h3><span class="product-spec">200ml × 12 瓶</span><div class="product-price">NT$ 480</div></div></a>
      </div>
      <div class="hub-loadmore"><button type="button">載入更多 · 還有 32 項</button></div>
    </div>

    <!-- 飲品茶水 -->
    <div class="hub-panel" data-panel="drinks" role="tabpanel" hidden>
      <div class="hub-grid">
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-01.jpg" alt="阿里山烏龍"></div><div class="product-body"><span class="product-brand">阿里山茶莊</span><h3 class="product-name">阿里山高山烏龍茶</h3><span class="product-spec">150g × 2 罐</span><div class="product-price">NT$ 1,280</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-02.jpg" alt="蜜香紅茶"></div><div class="product-body"><span class="product-brand">魚池紅茶</span><h3 class="product-name">日月潭蜜香紅茶</h3><span class="product-spec">75g × 3 罐</span><div class="product-price">NT$ 880</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-03.jpg" alt="花茶"></div><div class="product-body"><span class="product-brand">山下農場</span><h3 class="product-name">玫瑰洛神花茶</h3><span class="product-spec">15 包 × 2 盒</span><div class="product-price">NT$ 480</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-04.jpg" alt="冷泡茶"></div><div class="product-body"><span class="product-brand">輕茶手作</span><h3 class="product-name">冷泡茶包綜合組</h3><span class="product-spec">10g × 30 包</span><div class="product-price">NT$ 580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-01.jpg" alt="蜂蜜檸檬飲"></div><div class="product-body"><span class="product-brand">情人蜂蜜</span><h3 class="product-name">蜂蜜檸檬飲</h3><span class="product-spec">280ml × 12 瓶</span><div class="product-price">NT$ 580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-02.jpg" alt="芒果原汁"></div><div class="product-body"><span class="product-brand">玉井果園</span><h3 class="product-name">100% 芒果原汁</h3><span class="product-spec">200ml × 24 瓶</span><div class="product-price">NT$ 880</div></div></a>
      </div>
      <div class="hub-loadmore"><button type="button">載入更多 · 還有 20 項</button></div>
    </div>`;

pantry = pantry.replace(
  /<!-- 蔬菜 -->[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n<\/section>\s*\n\s*<!-- ═══ FOOTER/,
  pantryPanels + '\n\n  </div>\n</section>\n\n<!-- ═══ FOOTER'
);

fs.writeFileSync(path.join(ROOT, 'pantry.html'), pantry);
console.log('✓ pantry.html written ' + pantry.length + ' bytes');


// ═══ gift.html ═══
let gift = fresh
  .replace('<title>當季鮮食 — 台灣鮮農</title>', '<title>送禮與生活 — 台灣鮮農</title>')
  .replace(
    '蔬菜、水果、肉品、海鮮、蛋品米麵——當天從產地直送的台灣鮮味。台灣鮮農的當季鮮食總覽。',
    '禮盒專區、美妝保健——把台灣味送到對的人手上。每一份都附農友手寫卡片。'
  )
  .replace('<li class="current">當季鮮食</li>', '<li class="current">送禮與生活</li>')
  .replace(
    '<span class="hub-hero-icn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V10"/><path d="M12 10c-3 0-5-2-5-5 3 0 5 2 5 5z"/><path d="M12 10c3 0 5-2 5-5-3 0-5 2-5 5z"/></svg></span>',
    '<span class="hub-hero-icn"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="8" width="16" height="12"/><path d="M2 8h20"/><path d="M12 8v12"/><path d="M12 8c-2-3 1-5 2-3s-1 3-2 3z"/><path d="M12 8c2-3-1-5-2-3s1 3 2 3z"/></svg></span>'
  )
  .replace('<span class="hub-kicker">Fresh · 當季鮮食</span>', '<span class="hub-kicker">Gift &amp; Life · 送禮與生活</span>')
  .replace(
    '<h1 class="hub-h1">從產地直送的當天，<br>是最短的距離</h1>',
    '<h1 class="hub-h1">把台灣味，<br>送到對的人手上</h1>'
  )
  .replace(
    '<p class="hub-lead">蔬菜、水果、肉品、海鮮、蛋品米麵——產地凌晨採收、當天裝箱、48 小時內到你家。我們連結 200+ 認證農友，每件都看得到名字。</p>',
    '<p class="hub-lead">節氣禮盒、農友禮盒、美妝保健——精選當季農作製成的伴手禮、自用送禮兩相宜。每一份都附農友手寫卡片。</p>'
  )
  .replace('<div><strong>238</strong>項商品</div>', '<div><strong>66</strong>項商品</div>')
  .replace('<div><strong>5</strong>大分類</div>', '<div><strong>2</strong>大分類</div>')
  .replace('<div><strong>48hr</strong>到家</div>', '<div><strong>免費</strong>客製卡片</div>')
  .replace('aria-label="當季鮮食分類"', 'aria-label="送禮與生活分類"');

const giftTabs = `<button type="button" class="hub-tab active" data-tab="giftbox" role="tab" aria-selected="true">
        <span class="icn"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="8" width="16" height="12"/><path d="M2 8h20M12 8v12"/></svg></span>
        禮盒專區<span class="count">40</span>
      </button>
      <button type="button" class="hub-tab" data-tab="beauty" role="tab" aria-selected="false">
        <span class="icn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c3 3 6 6 6 10a6 6 0 0 1-12 0c0-4 3-7 6-10z"/><path d="M9 14c0 1.5 1.5 3 3 3"/></svg></span>
        美妝保健<span class="count">26</span>
      </button>`;

gift = gift.replace(
  /<button type="button" class="hub-tab active" data-tab="veg"[\s\S]*?蛋品米麵<span class="count">38<\/span>\s*<\/button>/,
  giftTabs
);

gift = gift.replace(
  /const TAB_INFO = \{[\s\S]*?\};/,
  `const TAB_INFO = {
    giftbox: { name:'禮盒專區', count:40 },
    beauty:  { name:'美妝保健', count:26 },
  };`
);
gift = gift.replace("const initial = params.get('cat') || 'veg';", "const initial = params.get('cat') || 'giftbox';");
gift = gift.replace("if (!TAB_INFO[key]) key = 'veg';", "if (!TAB_INFO[key]) key = 'giftbox';");
gift = gift.replace('<strong id="hub-count">62</strong>', '<strong id="hub-count">40</strong>');
gift = gift.replace('<span id="hub-cat-name">蔬菜</span>', '<span id="hub-cat-name">禮盒專區</span>');

const giftPanels = `<!-- 禮盒專區 -->
    <div class="hub-panel is-active" data-panel="giftbox" role="tabpanel">
      <div class="hub-grid">
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-01.jpg" alt="蜂蜜禮盒"></div><div class="product-body"><span class="product-brand">情人蜂蜜</span><h3 class="product-name">經典百花蜜禮盒</h3><span class="product-spec">420g × 2 · 雙瓶禮盒</span><div class="product-price">NT$ 660</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-02.jpg" alt="龍眼蜜"></div><div class="product-body"><span class="product-brand">情人蜂蜜</span><h3 class="product-name">行家獻藝龍眼蜜</h3><span class="product-spec">700g · 深色熟蜜</span><div class="product-price">NT$ 780</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-01.jpg" alt="湯品禮盒"></div><div class="product-body"><span class="product-brand">好呷覓</span><h3 class="product-name">經典湯品禮盒</h3><span class="product-spec">7 包綜合組</span><div class="product-price">NT$ 1,200</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-02.jpg" alt="水果禮盒"></div><div class="product-body"><span class="product-brand">玉井果園</span><h3 class="product-name">愛文芒果禮盒</h3><span class="product-spec">2kg · 6 顆 · 含手提袋</span><div class="product-price">NT$ 880</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/calendar-01.jpg" alt="水果月曆"></div><div class="product-body"><span class="product-brand">農聯社</span><h3 class="product-name">2026 水果月曆禮盒</h3><span class="product-spec">月曆 + 12 包茶</span><div class="product-price">NT$ 580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-03.jpg" alt="台味伴手禮"></div><div class="product-body"><span class="product-brand">好呷覓</span><h3 class="product-name">台味伴手禮三入</h3><span class="product-spec">含醬油 + 麻油 + 蜂蜜</span><div class="product-price">NT$ 780</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-04.jpg" alt="高山茶禮盒"></div><div class="product-body"><span class="product-brand">阿里山茶莊</span><h3 class="product-name">高山茶禮盒</h3><span class="product-spec">75g × 4 罐</span><div class="product-price">NT$ 1,580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-01.jpg" alt="穀雨春釀"></div><div class="product-body"><span class="product-brand">節氣選物</span><h3 class="product-name">穀雨春釀禮盒</h3><span class="product-spec">茶 + 蜜 + 文字小卡</span><div class="product-price">NT$ 1,280</div></div></a>
      </div>
      <div class="hub-loadmore"><button type="button">載入更多 · 還有 32 項</button></div>
    </div>

    <!-- 美妝保健 -->
    <div class="hub-panel" data-panel="beauty" role="tabpanel" hidden>
      <div class="hub-grid">
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-02.jpg" alt="洗髮精"></div><div class="product-body"><span class="product-brand">波瑟沙</span><h3 class="product-name">玫瑰洗髮精</h3><span class="product-spec">450ml</span><div class="product-price">NT$ 580</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-03.jpg" alt="月見草精油"></div><div class="product-body"><span class="product-brand">波瑟沙</span><h3 class="product-name">月見草精油</h3><span class="product-spec">10ml × 3 瓶</span><div class="product-price">NT$ 880</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-04.jpg" alt="蜂膠"></div><div class="product-body"><span class="product-brand">情人蜂蜜</span><h3 class="product-name">巴西綠蜂膠滴劑</h3><span class="product-spec">30ml × 2 瓶</span><div class="product-price">NT$ 1,280</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/honey-04.jpg" alt="花粉"></div><div class="product-body"><span class="product-brand">情人蜂蜜</span><h3 class="product-name">天然花粉膠囊</h3><span class="product-spec">120 顆</span><div class="product-price">NT$ 880</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/findfood-01.jpg" alt="紅棗酵素"></div><div class="product-body"><span class="product-brand">公館紅棗</span><h3 class="product-name">紅棗養顏酵素</h3><span class="product-spec">200ml × 6 瓶</span><div class="product-price">NT$ 980</div></div></a>
        <a href="product-detail.html" class="product-card sq"><div class="product-img"><img src="images/tfa/posesha-01.jpg" alt="苦茶油皂"></div><div class="product-body"><span class="product-brand">老欉苦茶</span><h3 class="product-name">苦茶油手工皂</h3><span class="product-spec">100g × 3 顆</span><div class="product-price">NT$ 480</div></div></a>
      </div>
      <div class="hub-loadmore"><button type="button">載入更多 · 還有 20 項</button></div>
    </div>`;

gift = gift.replace(
  /<!-- 蔬菜 -->[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n<\/section>\s*\n\s*<!-- ═══ FOOTER/,
  giftPanels + '\n\n  </div>\n</section>\n\n<!-- ═══ FOOTER'
);

fs.writeFileSync(path.join(ROOT, 'gift.html'), gift);
console.log('✓ gift.html written ' + gift.length + ' bytes');
