# 04 · 前端開發指南

> **這份文件的目的：** 你和未來接手者開發前端的完整守則。
> **範圍：** 本地環境、檔案結構、命名、CSS / JS / HTML 規範、Git workflow、常見坑。

---

## 1. 本地開發

### 環境需求
- Node.js ≥ 18（只用來跑圖片優化、本地 server）
- Git
- VS Code（建議裝 Live Server / EditorConfig 套件）

### 啟動本地 server
```bash
# 方法 A：用 .claude/launch.json 的 tfa-static
npx http-server -p 5174

# 方法 B：VS Code 點 Live Server
# 方法 C：直接 file:// 開（部分功能會壞，例如 fetch 跨域）
```

### 圖片優化（如有新加大圖）
```bash
npm install sharp           # 第一次裝
node scripts/optimize-images.js
```
原則：images/ 下任何 > 2000px 長邊的圖會被縮、JPG 重壓 quality 82、PNG palette 化。
備份：靠 git，不額外做。

---

## 2. 檔案結構

```
tfa-redesign/
├─ index.html                  首頁
├─ {brand,farmers,products}.html
├─ {spring,summer,autumn,winter}.html       四季頁
├─ farmer-detail.html         農友詳情
├─ farmer-products.html       農友商品
├─ product-detail.html        商品詳情
├─ story-{homecoming,2ndgen,legacy,mastery}.html
├─ join-farmer.html           農友申請
├─ checkout.html              結帳
├─ preview.html               視覺 / 元件 preview
│
├─ css/
│  └─ styles.css              ⚠️ 全站樣式都在這一個檔（3500+ 行）
│
├─ js/
│  ├─ loader.js               稻穗 loading 動畫
│  ├─ mobile-nav.js           手機漢堡抽屜
│  ├─ nav-actions.js          搜尋 / 購物車 / 登入 overlay
│  └─ （未來新增 api.js / auth.js / cart.js …）
│
├─ images/                    圖片素材
├─ scripts/
│  └─ optimize-images.js      Node 批次優化圖片
├─ docs/                      ★ 你正在看的開發文件
│
├─ .claude/
│  └─ launch.json             Claude Code 用，本地 server 設定
└─ .gitignore
```

### 為什麼 styles.css 不拆？
歷史包袱 + 拆檔需要打包工具。拆的代價 > 收益（目前）。
**重構時機：** 等遷移到 Astro / Vite 時順便拆 SCSS / CSS Modules。

---

## 3. CSS 規範

### Design tokens（CSS variables）
全站變數定義在 `:root`（檔案開頭），用法：
```css
.example {
  color: var(--ink);
  background: var(--paper);
  border-color: var(--rule);
}
```

主要 tokens：
```
--paper, --paper-warm, --paper-card    紙底色系
--ink, --ink-mid, --ink-light          字色
--pine                                 松綠（主題色）
--vermillion, --vermillion-pale        朱紅（強調）
--gold                                 金黃（穀粒、節氣）
--earth, --earth-pale                  土色
--rule, --rule-dark                    分隔線
--font-serif                           Noto Serif TC
--font-sans                            Noto Sans TC
--font-latin                           DM Sans
```

### 命名慣例（BEM-lite）
```css
.farmers-stage          區塊
.farmers-stage__image   區塊內元素（少用 __，多半直接 .farmers-image）
.farmers-stage--alt     變體
```
實際上專案多半用「**前綴 + dash**」：`.farmers-*`、`.product-*`、`.tfa-loader-*`，因為樣式是寫給 HTML class 而非 component。

### 響應式斷點
```css
/* mobile first，然後依序加 */
@media (min-width: 640px)  { ... }   /* sm 以上：手機橫 / 小平板 */
@media (min-width: 1024px) { ... }   /* lg 以上：桌機 */
@media (min-width: 1440px) { ... }   /* xl 以上：寬螢幕 */
```
**不要用 `max-width`** 除非萬不得已（會跟 mobile-first 衝突）。

### Z-index 層級
```
1     背景裝飾（::before, ::after）
2     區塊內容
5     breadcrumb（疊在 hero 上）
40    nav.main（sticky）
45    mega-panel
100   na-backdrop（搜尋 / 購物車遮罩）
110   na-overlay（搜尋面板）
120   mnav-drawer（手機選單）
200   tfa-loader（載入動畫，蓋一切）
```
**新增層級先看這張表，避免疊到 nav 之上。**

---

## 4. JavaScript 規範

### 風格
- ES2020+，**不用 Babel / TypeScript**（保持純 JS 上線即可）
- 全部 module 用 IIFE（`(()=>{ ... })()`）避免污染全域
- 對外 API 掛在 `window.TFA*` namespace（例：`window.TFALoader`）

### 命名
```js
const FOO_CONST       = 'foo';     // 常數 SCREAMING_SNAKE
let counter           = 0;          // 變數 camelCase
function doSomething() {}           // 函式 camelCase
class FarmerCard {}                 // 類別 PascalCase（很少用）
```

### API 呼叫（之後要加的 `js/api.js`）
建議統一這樣寫：
```js
window.TFA = window.TFA || {};
window.TFA.api = (() => {
  const BASE = '/api';
  const token = () => localStorage.getItem('tfa_token');

  async function request(path, opts = {}) {
    const res = await fetch(BASE + path, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token() ? { 'Authorization': 'Bearer ' + token() } : {}),
        ...(opts.headers || {})
      },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    if (res.status === 401) {
      localStorage.removeItem('tfa_token');
      window.dispatchEvent(new Event('tfa:logout'));
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error(err.message || res.statusText), { status: res.status, errors: err.errors });
    }
    return res.json();
  }

  return {
    get:  (p)        => request(p),
    post: (p, body)  => request(p, { method: 'POST',  body }),
    patch:(p, body)  => request(p, { method: 'PATCH', body }),
    del:  (p)        => request(p, { method: 'DELETE' }),
  };
})();
```

用法：
```js
const { data: farmers } = await TFA.api.get('/farmers?region=雲林');
```

### Loader 整合
資料載入時包 `TFALoader.wrap()`：
```js
const data = await TFALoader.wrap(
  TFA.api.get('/farmers'),
  '載入農友資料…'
);
```

---

## 5. HTML 規範

### 一致的 nav 區塊
全站 17 頁的 `<nav class="main">` 必須用同一份 markup。改 nav 用 `node` 腳本批量：
```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('products.html','utf8').split('\n').slice(18,171).join('\n');
['index.html','brand.html',...].forEach(f => {
  let s = fs.readFileSync(f,'utf8');
  s = s.replace(/<nav class=\"main\">[\s\S]*?<\/nav>/, src);
  fs.writeFileSync(f,s);
});
"
```

### Class 命名（HTML 用）
- 區塊：`.farmers-section`、`.pd-hero`（page-detail-hero）、`.cat-group`
- 卡片：`.product-card`、`.farmer-card`
- 控制：`.btn`、`.pill`、`.tag`
- 工具：`.show-lg`（≥1024 顯示）、`.hidden-lg`

### 必加屬性
- `<img>` 一律有 `alt`
- 表單 `<input>` 一律有 `<label>` 連動
- 按鈕：互動用 `<button type="button">`，導頁用 `<a href>`
- ARIA：dialog 加 `role="dialog" aria-label="..."`

---

## 6. 常見坑（從這個專案的歷史踩來的）

| 坑 | 解 |
|---|---|
| Grid 內元素 overflow 溢出（行寬超過容器） | 父 grid 用 `grid-template-columns: minmax(0, 1fr)`，子加 `min-width: 0` |
| `mix-blend-mode: multiply` 永遠變暗 | 改用 `darken` 或 `lighten`，配合 background 同色才能「融入」 |
| SVG `<image>` 和路徑點不對齊 | 加 `preserveAspectRatio="none"` 或統一 viewBox 比例 |
| 動畫 hover 一直閃 | 不要在 hover 動畫中改 `r` / `width` 這種觸發 reflow 的屬性，改用 `transform: scale()` |
| 手機 nav-links 字消失 | 那些 li 在 ≤1023px 是 `display:none`，要靠 `mobile-nav.js` 注入漢堡抽屜 |
| `:has()` 選擇器在舊瀏覽器無效 | Chrome 105+ / Safari 15.4+ / Firefox 121+ 才支援，不要用在關鍵功能 |
| Loader 順序「頁面 → 動畫 → 頁面」 | loader.js 必須放 `<head>` 且非 defer，`document.body` 沒準備好時掛到 `documentElement` |
| Cat-group 的 sidebar 被亂套 | `.cat-group:has(.fresh-tabs) .container` 才套 grid |
| 圖片 OOM / 載入慢 | 跑 `scripts/optimize-images.js`；新加的圖也要跑一次 |

---

## 7. Git workflow

### 分支
- `main` — 隨時可上線
- `feat/xxx` — 新功能
- `fix/xxx` — 修 bug
- `chore/xxx` — 構建 / 文件 / 雜項

### Commit 格式（這個 repo 一直在用的）
```
<type>: <短摘要 70 字內>

<空行>
- 重點 1
- 重點 2

<空行>
Co-Authored-By: ...
```
type ∈ `feat / fix / refactor / docs / style / perf / test / chore`

### PR 自我檢查
- [ ] 改 API 合約 → `docs/02-api-contract.md` 也改了
- [ ] 改資料 shape → `docs/03-data-models.md` 也改了
- [ ] 跨頁影響 → 17 頁都測過
- [ ] 手機 / 平板 / 桌機都看過
- [ ] 圖片 > 500KB → 跑 optimize-images.js
- [ ] Console 沒 error / warning

---

## 8. 跟後端對齊的時機

### 一定要先講再做
- 新增 API endpoint
- 改現有 API 的 request / response 形狀
- 改認證流程（token 存哪、何時帶）
- 改檔案上傳路徑

### 可以做完再通知
- UI 樣式調整
- 加假資料（只要不影響真資料）
- 文件補強

### 對方要先講才能動的
- DB schema 改變（會影響 API 回傳）
- 業務邏輯改動（價格計算、庫存規則）
- 環境變數 / API URL 變動

---

## 9. 上線前的 Final Check

```
□ 17 頁手機 / 桌機都跑過
□ 所有 form 都送過至少一次（含失敗 case）
□ console 沒 error
□ 4G 網路下首頁 LCP < 3 秒
□ Lighthouse 行動版 > 80 分
□ 所有外連的圖 / 字型 / API URL 都改成正式
□ favicon、manifest.json、apple-touch-icon 都有
□ Open Graph / Twitter Card 預覽過
□ 404 頁、500 頁有
□ robots.txt、sitemap.xml 上線
□ GA / FB Pixel 埋對
□ SSL 憑證綠色
□ www / 非 www 互轉
□ 備份機制 / 災難復原 plan
```
