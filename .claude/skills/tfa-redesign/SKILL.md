---
name: tfa-redesign
description: 台灣鮮農（TFA）品牌電商網站的開發規範與設計語言。技術棧為純靜態 HTML / CSS / vanilla JS（前端）+ Laravel 11 + Filament + MySQL（後端，docs/10）+ YouTube（影片）+ Cloudflare R2（圖片）。當任何工作涉及這個 repo（路徑含 `tfa-redesign` 或 `tfa.com.tw`）、24 頁前台 HTML、`docs/` 規範文件、或 farmer / product / season / coupon 等品牌相關元件時，務必先讀這份 Skill。觸發關鍵字：台灣鮮農、TFA、農友夥伴、節氣選品、波瑟沙茶樹田、阿甘、紀錄片 + 短影音、Laravel Filament、稻穗 loader、Films Shorts、promo-tile。
---

# 台灣鮮農 TFA · 開發 Skill

> 此 Skill 的設計目的：讓 Claude 在任何 TFA 相關工作開始前，**先載入這套規範**，避免重複踩過去解過的坑、避免破壞已建立的設計語言。

---

## 0. 永遠先做的 4 件事

當任何 TFA 任務進來，**順序執行**：

```
1. 看 docs/README.md      ── 確認文件版圖
2. 看 docs/06-changelog.md ── 看最近改了什麼，避免覆蓋
3. 看本檔 §3 設計 tokens   ── 確保色彩 / 字型 / 命名一致
4. 確認任務性質：
   - 內容變動？        → 改完寫 changelog
   - API 合約變動？    → 先改 docs/02-api-contract.md 才動 code
   - DB schema 變動？  → 先改 docs/03-data-models.md 才動 code
   - 視覺變動？        → 用既有 token，不發明新色
```

---

## 1. 專案身份（記住這 4 點）

```
名稱：     台灣鮮農 Taiwan Freshness Agriculture (TFA)
品牌核心： 「人的 IP」── 不賣商品，賣農友本人
規模：     200+ 認證農友、18 縣市產地、48hr 直送、滿 NT$ 999 免運
口號：     「每一份食材背後都有一個名字」
```

**禁忌：** 文案不要用「最便宜」「No.1」「保證」這類俗氣行銷詞。  
**慣用：** 「自然農法」「節氣」「產地直送」「親手採收」「世代傳承」這類關鍵字。

---

## 2. 技術棧速查

```
前端：     HTML + CSS（純） + vanilla JS（IIFE 模組）
           無 build pipeline、無 framework、無 npm runtime deps
           24 個前台 HTML（list 見 docs/04-frontend-guide.md §2）

字型：     Noto Serif TC（中文標題）
           Noto Sans TC（中文內文）
           DM Sans（拉丁字、kicker、數字）

後端：     Laravel 11 + Filament v3 + MySQL 8（docs/10）
           尚未開始實作（前端先動，contract 已定）

媒體：     影片 → YouTube Lite Embed（docs/08）
           圖片 → Cloudflare R2 + Image Transformations
           ⚠️ 不要建議改 Astro / Next.js — 已決議用 Laravel SSR

部署：     GitHub Pages（demo / preview）
           上線後 → 自架 EC2 / VPS + Nginx + PHP-FPM
```

---

## 3. Design Tokens（CSS variables，定義在 styles.css 第 5-11 行）

### 顏色

```css
/* 紙底色系（依層次三層）*/
--paper:        #f8f4ec;   /* body 預設背景 */
--paper-warm:   #f2ece0;   /* 區塊間隔 */
--paper-card:   #fdfaf4;   /* 卡片底色 */

/* 松綠（主品牌色，用於 nav links / strong / pine 強調）*/
--pine:         #2c4a35;
--pine-mid:     #3d6148;
--pine-light:   #e8efe9;
--leaf:         #618f5e;

/* 朱紅（CTA / 警示 / 限定品）*/
--vermillion:      #c8402a;
--vermillion-mid:  #d4563e;
--vermillion-pale: #faede9;

/* 金黃（節氣 / 倒數 / 高亮 / 榖粒）*/
--gold:      #c49428;
--gold-mid:  #d9a942;
--gold-pale: #fdf6e3;

/* 字色 */
--ink:       #1e2820;   /* 標題 / 主文 */
--ink-mid:   #4a5448;   /* 副文 */
--ink-light: #8a9488;   /* 提示 / kicker */

/* 線色 */
--rule:      薄淡灰
--rule-dark: 較深分隔線
```

**強規則：永遠用 var(--xxx) 不要寫死十六進位**（除了專屬區段如 .promo-tile.hot 的紅、.promo-tile.sale 的黃這種 design accent）。

### 字型 token

```css
--font-serif:  'Noto Serif TC', serif;
--font-sans:   'Noto Sans TC', sans-serif;
--font-latin:  'DM Sans', sans-serif;   /* 數字 / 英文 / kicker */
```

### 響應式斷點（mobile-first，永遠用 min-width）

```css
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1440px) { /* xl */ }
```

**禁忌：不要用 `max-width` 做響應式**（會跟既有 mobile-first 衝突）。

### Z-index 階層表

```
1     背景裝飾（::before / ::after）
2     一般區塊內容
5     breadcrumb（疊在 hero 上）
8     hub-tabs-bar sticky
40    nav.main（sticky）
45    mega-panel
100   na-backdrop（遮罩）
110   na-overlay（搜尋）
120   mnav-drawer（手機選單）
200   tfa-loader（覆蓋一切）
```

新增 z-index **務必查這張表，避免疊到 nav 之上**。

---

## 4. CSS 命名前綴（class prefix system）

每個區塊用前綴隔離 scope，**不要互用對方的 class**：

| 前綴 | 用於哪 | 出現在 |
|---|---|---|
| `.farmers-*` | 首頁 + farmers.html 農友列表 | styles.css 共用 |
| `.farmer-card-*` | 農友卡片 | styles.css 共用 |
| `.farmer-*` | 農友詳情（fh / fd 內含）| styles.css 共用 |
| `.fd-*` | farmer-detail 內部區段（fd-story / fd-glance / fd-loc）| styles.css 共用 |
| `.fh-*` | farmer-hero 內部 | styles.css 共用 |
| `.product-*` | 商品卡片、商品列表 | styles.css 共用 |
| `.pd-*` | product-detail 內部 | styles.css 共用 |
| `.cat-*` | 商品分類 | styles.css 共用 |
| `.cat-group-*` | products.html cat-group 區塊 | styles.css 共用 |
| `.fresh-tab*` | 分類 tabs（products.html）| styles.css 共用 |
| `.hub-*` | fresh / pantry / gift hub 頁 | inline style |
| `.cp-*` | coupons.html 票券 | inline style |
| `.ct-*` | contact.html | inline style |
| `.jf-*` | join-farmer.html | inline style |
| `.legal-*` | privacy.html / terms 等法務頁 | inline style |
| `.tfa-yt*` | YouTube Lite Embed 元件 | styles.css |
| `.tfa-loader*` | 稻穗 loading | styles.css |
| `.mnav-*` | 手機漢堡抽屜 | styles.css |
| `.na-*` | nav-actions（搜尋 / 購物車 / 登入 modal）| styles.css |
| `.promo-tile*` | products.html 上方 6 格 | styles.css |
| `.flash-*` | 限時優惠區（id="flash"）| styles.css |
| `.top10-*` | 上週熱銷排行（id="top10"）| styles.css |

**使用規則：**
1. 修改某區塊只動該前綴的 class
2. 新元件命名前先看上面有沒有重複
3. inline style 區塊（join-farmer / contact / privacy / fresh / pantry / gift / coupons）的 class **不放進 styles.css**，保留自包含

---

## 5. JavaScript 規範

### 6 個元件檔（js/）的職責

```
loader.js        ── 稻穗生長 loading（head 同步載入，蓋首屏）
mobile-nav.js    ── 手機漢堡抽屜（自動注入 / 全站作用）
nav-actions.js   ── 搜尋 / 購物車 drawer / 登入 modal（事件委派）
tfa-youtube.js   ── YouTube Lite Embed（.tfa-yt / .tfa-yt-card）
pd-manual.js     ── 商品敘述圖 lightbox（含鍵盤、prev/next）
（待寫：api.js / auth.js / cart.js / seller-uploader.js）
```

### 慣用 pattern

```js
// 1. 全部模組用 IIFE 避免汙染全域
(() => { ... })();

// 2. 對外 API 掛 window.TFA*
window.TFALoader = { show, hide, wrap };
window.TFAYouTube = { create, activate, extractId };

// 3. 互動 = 事件 → 改 class → CSS 反應（state-driven）
button.classList.toggle('is-active', isActive);
//        ^^^ JS 不直接改 style，只改 class

// 4. 事件委派優於逐顆綁定
document.addEventListener('click', e => {
  const target = e.target.closest('.thing');
  if (target) handleClick(target);
});

// 5. 命名：is-* / has-* / data-*
// CSS 狀態類：is-open / is-active / is-faved / is-loading
// 資料 hook：data-tab / data-cat / data-no-loader
```

### 重要 a11y 慣例

```
互動：     <button type="button">
導頁：     <a href="...">
ARIA：     dialog 加 role="dialog" aria-label="..."
切換：     aria-expanded / aria-pressed / aria-selected 跟 class 同步
預設可選： tabindex="0" 配合 Enter/Space 鍵盤觸發
```

---

## 6. 過去踩過的 13 個坑（⚠️ 不要再踩）

來自 docs/04-frontend-guide.md §6 + changelog 累積：

| 坑 | 發生條件 | 解法 |
|---|---|---|
| Grid overflow 把 body 撐爆 | flex 子元素 min-width:auto | 父 grid 用 `minmax(0,1fr)`、子元素 `min-width:0` |
| `mix-blend-mode: multiply` 永遠變暗 | 想讓圖融入背景 | 改用 `darken`，配相同色背景才能「融入」 |
| SVG image 跟路徑點不對齊 | viewBox 比例不符 | 加 `preserveAspectRatio="none"` 或統一比例 |
| Hover 動畫一直閃 | `:hover` 動畫改 r / width 觸發 reflow | 改用 `transform: scale()` |
| 手機 nav-links 字消失 | li 在 ≤1023px display:none | 靠 `mobile-nav.js` 注入漢堡抽屜 |
| `:has()` 在舊瀏覽器無效 | Chrome <105 / Safari <15.4 | 別用在關鍵功能 |
| Loader「頁面→動畫→頁面」順序怪 | DOMContentLoaded 才 mount | head 立即 mount 到 documentElement |
| Cat-group sidebar 套錯 | 規則沒限縮 | `.cat-group:has(.fresh-tabs) .container` |
| 圖片 OOM | 沒跑優化 | `node scripts/optimize-images.js` |
| Cart drawer 開很慢 | loader.js click 在 capture phase | 改 bubble phase（false）並讀 e.defaultPrevented |
| 愛心鈕 width 卡 24px | aspect-ratio + flex-basis:auto + stretch 三合一 bug | 直接給 `flex: 0 0 4.2rem` 顯式寬 |
| 限時優惠 / 熱銷排行語意錯位 | promo-tile 跳到名字不一致的區段 | 標題跟 anchor target 一致 |
| `bg: transparent` 透出 body 色 | `--paper` 從下面透上來 | 給該區塊明確背景色 |

---

## 7. 已決策「不做」的事項（⚠️ 不要建議重做）

```
✗ Astro / Next.js     → 已決定用 Laravel SSR（docs/10）
✗ 評價系統            → 已移除，改顯示「N 位顧客買過」（commit 80300d3）
✗ 商品履歷時間軸       → 已移除（commit 35dea45）
✗ farmer-detail 地圖   → SVG 太貴每位都要重畫，已拿掉（commit 7249642）
✗ farmer-detail LOCATION 整區 → 已拿掉（commit bed4f3c）
✗ 食譜廚房 nav 項      → 已移除（commit 0952a02）
✗ 自家影片轉檔串流      → 走 YouTube（docs/08）
✗ 自架圖片 resize      → 走 Cloudflare（docs/08）
```

---

## 8. 媒體處理規則

### 影片
```
全站影片 → YouTube（不公開 unlisted）
HTML：    <div class="tfa-yt" data-id="VIDEO_ID" data-title="..."> ... </div>
JS：      js/tfa-youtube.js 已處理 click → iframe swap
縮圖：    img.youtube.com/vi/{ID}/maxresdefault.jpg + hqdefault fallback
```

### 圖片
```
專案內：images/{tfa,...}/*.jpg
新加大圖：node scripts/optimize-images.js（自動縮 max 2000px）
未來：上傳走 Cloudflare R2 + Image Transformations
alt：每張都要寫具體（不要空 alt 或只寫農友名）
```

---

## 9. SEO 必做事項（本案已建立）

```
全站 24 頁（含未來新頁）必有：
  ✓ <title> 25-30 中文字、含主關鍵字
  ✓ <meta description> 120-160 字
  ✓ <link rel="canonical"> 絕對 URL 指向自己
  ✓ Open Graph 7 條（type / title / description / url / image / site_name / locale）
  ✓ Twitter Card 4 條
  ✓ <meta name="theme-color" content="#c8402a">
  ✓ favicon + manifest 連結
  
不該被索引的頁（checkout / preview）：
  ✓ <meta name="robots" content="noindex,nofollow">

新增頁面：
  → 跑 `node scripts/inject-seo.js` 自動注入 SEO meta
  → 加進 sitemap.xml
```

完整 SOP 見 `docs/12-seo-playbook.md`。

---

## 10. Pre-Flight Checklist（任何工作開始前 30 秒過一次）

```
任務性質？
  □ 改視覺   → 用既有 token、檢查 z-index 表、跟 §6 坑表確認
  □ 改互動   → state-driven via class toggle、不直接改 style
  □ 改內容   → docs/06-changelog 寫一條、避免動到結構
  □ 加新頁   → 套 nav 模板、跑 inject-seo.js、加 sitemap
  □ 加 API   → 先改 docs/02 / docs/03、後動 code
  □ 大改架構  → 先看 §7 已決策不做，避免重做
  
完成後：
  □ git commit 訊息含 commit type（fix / feat / refactor / docs）
  □ 影響跨頁 → 17 頁實際開過
  □ 改 schema → docs/03 + docs/06 同步
  □ 改 API 合約 → docs/02 + docs/06 同步
  □ 圖片 > 500KB → 跑 optimize-images.js
```

---

## 11. 文件指引（深入閱讀順序）

```
全員必讀：     docs/README.md（速查）
                docs/01-scope-split.md（前後端分工）

後端工：       docs/02-api-contract.md
                docs/03-data-models.md
                docs/07-farmer-marketplace.md
                docs/10-cms-architecture.md ← Laravel Filament 建議

前端工：       docs/04-frontend-guide.md ← 本檔擴充版
                docs/09-templating-feasibility.md（哪些可模板）

媒體決策：     docs/08-media-strategy.md

SEO：          docs/12-seo-playbook.md（永久 SOP）

部署：         docs/05-deploy-handoff.md

異動紀錄：     docs/06-changelog.md（任何改動先看這個）
```

---

## 12. 取得專案狀態的快指令

```bash
# 當前 commit
git log --oneline -5

# 24 頁 HTML 列表 + meta 健康度
for f in *.html; do
  t=$(grep -oE '<title>[^<]+</title>' "$f" | head -1 | sed 's/<[^>]*>//g')
  d=$(grep -c 'rel="canonical"' "$f")
  echo "  $f → title:[${t}] canonical:$d"
done

# CSS / JS 規模
wc -l css/styles.css js/*.js

# 文件規模
wc -l docs/*.md
```

---

## 13. 一句話總結

> **設計緊貼「人的 IP」、技術緊貼「Laravel + Filament」、流程緊貼「docs/06 changelog 強制」。**  
> 任何不確定先看 docs/06 最近 5 條改動 + 本 Skill §7「不做」清單，避免衝突。
