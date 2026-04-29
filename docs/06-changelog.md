# 06 · API / Schema 異動紀錄

> **這份文件的目的：** 任何 API 合約 / 資料模型異動都記在這。
> **規則：** 改 `02-api-contract.md` 或 `03-data-models.md` 必須在這加一條，才合 PR。

---

## 格式

```
## YYYY-MM-DD — 改動標題
**作者：** XXX  
**影響面：** 前端 / 後端 / DB / 全部  
**異動類型：** Breaking / Non-breaking / Deprecation

### 變更內容
- 詳細列出改了什麼

### 遷移路徑
- 舊版怎麼改成新版（給對方看的）

### 預計上線
- YYYY-MM-DD
```

---

## 2026-04-29 — 模板化可行性盤點 + 拿掉 SVG 地圖

**作者：** 前端  
**影響面：** 前端 + 後端 + DBA  
**異動類型：** Non-breaking（決策 + 設計變更）

### 變更內容

#### 程式碼
- `farmer-detail.html`：拿掉 LOCATION 區塊裡的內嵌 SVG 手繪地圖
  - 改成單欄置中限寬的純文字版本（保留 4 行重點 + 座標數字）
  - 原因：手繪地圖每位農友都不同，等同 12 張獨立美術稿（成本太高）
- `css/styles.css`：新增 `.fd-loc-grid--single` 變體，max-width 780px 置中

#### 新文件
- `docs/09-templating-feasibility.md`（新增）— 完整盤點 farmer-detail / product-detail
  每個區塊：
  - 🟢 容易模板（標準欄位 / 關聯）
  - 🟡 可模板但要 1:N 子表
  - 🔴 實質做不到（已決策拿掉或改設計）
  - 含 SQL DDL 範例、Blade 範例、編輯後台需求

#### 資料模型增補（docs/03-data-models.md）
新增 4 個模型 + farmers/products 表加欄位：
- `FarmerQA` (1:N) — 訪談 Q&A
- `FarmerGallery` + `FarmerGalleryItem` (1:1 + 1:N) — 農場一日 gallery
- `FarmerGlance` (1:N) — 策展數字條
- `ProductTraceabilityStep` (1:N) — 商品履歷時間軸
- `farmers` 加欄位：`seal_text`（印章直書 + 斷字符）、`years_collab`、`years_growing`、`method`、`category`、`lat`/`lng`
- `products` 加欄位：`tagline`（商品故事主標）

### 對後端的影響（重點）
- 4 張新表（DDL 在 09 文件第 4 節有完整 SQL）
- 編輯後台必須是富文本編輯器（TinyMCE / TipTap），不能用 plain textarea
- 必須支援 1:N 拖曳排序（Q&A、gallery items、glances、traceability steps）

### 對內容團隊的影響
- 第一波 5 位種子農友每位編輯產出 1-2 工作天
- 後續農友 Blade 用 `@if` 判斷，沒填的子表區塊不渲染（漸進式內容）

---

## 2026-04-29 — 文件大整理（contact.html 落地後）

**作者：** 前端  
**影響面：** 文件全部  
**異動類型：** Non-breaking

### 變更內容
- 新增 `docs/07-farmer-marketplace.md`（之前缺號的 07）
  - 多角色權限模型（customer / farmer / admin / super_admin）
  - 草稿 → 審核 → 發布流程 + `product_drafts` / `approval_records` 表
  - `farmer_profiles` 表（分潤、銀行帳號）
  - `/api/seller/*` endpoint 清單 + admin 審核補充
  - 工時估算：後端 20d + 前端 8d ≈ 28 工作天
  - 三階段上線計畫
- 更新 `docs/02-api-contract.md`
  - 新增 `POST /api/contact`（一般洽詢表單）含 topic enum、防濫用 429、寄信路由
- 更新 `docs/03-data-models.md`
  - 模型清單擴充（FarmerProfile / ProductDraft / ContactMessage / Media）
  - 新增 `ContactMessage` 完整定義
- 更新 `docs/README.md`
  - 文件導覽新增 07 / 08 條目 + 推薦閱讀順序
  - 加入 GitHub Pages 預覽環境
  - 補上技術棧速查（Laravel 11 + MySQL 8 + Cloudflare）
- 更新 `docs/04-frontend-guide.md`
  - 檔案結構樹同步加入 contact.html、tfa-youtube.js、四份新文件

---

## 2026-04-29 — contact.html 上線（聯絡我們統一入口）

**作者：** 前端  
**影響面：** 前端 + 後端  
**異動類型：** Non-breaking（新增頁面 + 新增 endpoint 需求）

### 變更內容
- 新增 `contact.html`：6 大區塊
  1. Hero
  2. Channels（4 卡：一般洽詢 / 成為農友 / 企業採購 / 媒體合作）
  3. General contact form（POST /api/contact）
  4. 成為農友 highlight section（pine bg + stats + CTA → join-farmer.html）
  5. Office info（地址 / 電話+Email / 客服時間）
  6. FAQ（6 題）
- 全站 nav mega-panel「聯絡我們」mailto → `contact.html`（14 頁）
- 全站 footer「聯絡窗口」mailto → `contact.html`（17 頁）
- 16 頁 footer 關於 col 加上「聯絡我們」連結

### 對後端的影響
- 新 endpoint：`POST /api/contact`（詳見 02-api-contract.md）
- 新資料表：`contact_messages`（詳見 03-data-models.md）
- 寄信邏輯：依 topic 路由到不同收件信箱

---

## 2026-04-29 — Films/Shorts anchor 修正 + 真實 YT 頻道

**作者：** 前端  
**影響面：** 前端 only  
**異動類型：** Non-breaking（bug fix）

### 變更內容
- 全站 14 頁 nav 的「紀錄片 / 短影音」連結之前都指向假的 `index.html#shorts`，
  修正為 `farmers.html#films` / `farmers.html#shorts`
- `farmers.html` 兩區塊加 `id="films"` / `id="shorts"` + `scroll-margin-top: 5rem`
- 三處「看全部紀錄片 / 看全部短影音」假網址 → 真實官方頻道
  `https://www.youtube.com/channel/UCW7vAQdtM1cRUL5WDlD5ahw`
- 統一 Films / Shorts 區塊主視覺文案：
  - Films · 農友紀錄 / 坐下來，看一段土地的時間
  - Shorts · 一分鐘農事 / 來他田裡看一眼

---

## 2026-04-29 — 媒體策略：影片走 YouTube、圖片走 Cloudflare

**作者：** 前端  
**影響面：** 全部  
**異動類型：** Non-breaking（新增功能）

### 變更內容
- 新增 `docs/08-media-strategy.md`，定案影片用 YouTube Lite Embed、圖片用 Cloudflare R2 + Image Transformations
- 新增 `js/tfa-youtube.js`，提供 `.tfa-yt` / `.tfa-yt-card` 兩種元件 + `TFAYouTube.create / activate / extractId` API
- `css/styles.css` 新增 `.tfa-yt-*` 樣式（含 reduced-motion fallback）
- `farmer-detail.html` 加影片區塊（主播放器 + 3 張列表卡）
- `product-detail.html` 加影片區塊（主播放器，採蜜實錄）
- 17 頁 HTML inject `js/tfa-youtube.js`

### 對後端 / DB 的影響（給後端同仁）
- `media` 表新增欄位：
  - `provider` ENUM('upload','youtube') DEFAULT 'upload'
  - `youtube_id` VARCHAR(20) NULL
  - `duration_sec` INT NULL
  - `thumbnail_url` VARCHAR(500) NULL
- 新 endpoint：`POST /api/seller/media/youtube`（接 url、抽 id、撈 oEmbed、存表）
- 詳細實作 checklist 在 `08-media-strategy.md` §5

### 預計上線
- 文件即時生效；後端視排程跟進

---

## 2026-04-29 — 文件初版建立

**作者：** 前端  
**影響面：** 全部  
**異動類型：** Non-breaking（首次建立）

### 變更內容
- 建立 `docs/` 資料夾
- 寫成 6 份分工 / 合約 / 模型 / 開發 / 部署 / 異動文件

### 遷移路徑
- 後端同仁先讀 `01-scope-split.md` 對齊責任分界
- 接著讀 `02-api-contract.md` + `03-data-models.md` 開始排 schema / endpoint 工

### 預計上線
- 文件即時生效

---

<!-- 之後的改動往下加，最新在最上面 -->
