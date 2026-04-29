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

## 2026-04-29 — 釐清「熱銷排行」與「Top 10 上週熱銷」語意

**作者：** 前端  
**影響面：** 前端文案 + 後端 API sort 參數  
**異動類型：** Non-breaking（文案修正 + 業務邏輯釐清）

### 變更內容
products.html 上方有兩個排行榜區塊，原本文案有歧義：

| 區塊 | 原副標 / 標題 | 修正後 | 業務定義 |
|---|---|---|---|
| `#flash` Hot · 熱銷排行 | 「上週 2,500 位顧客最常下單的 8 樣商品」| 「累積最多顧客回購、熱賣不墜的 8 樣商品」| **歷史紀錄以來** all-time 暢銷 |
| `#top10` Top 10 · 本週熱銷排行 | 標題「本週」| 標題改「上週」| **顧客上週最常下單** 的 10 樣 |

### 對後端 API 的影響
建議 `GET /api/products` 的 `sort` 參數支援兩種語意：

```
sort=popular_alltime  → ORDER BY purchase_count DESC（歷史累積）
sort=popular_week     → ORDER BY weekly_purchase_count DESC（上週統計）
                        需要排程每週日 23:59 重算 weekly_purchase_count
```

或新開兩個 endpoint：
- `GET /api/products/hot`     歷史暢銷
- `GET /api/products/top10`   上週前十名

請後端二選一定案後更新 02-api-contract.md。

---

## 2026-04-29 — 移除評價系統，改為「已購買數」純計數

**作者：** 前端  
**影響面：** 前端 + 後端 + DBA + 客服流程  
**異動類型：** Breaking（移除規劃中功能）

### 決策背景
評價系統技術上不難（5-10 天可完成），但**運營成本是無限的**：
誰每天看新評價、處理檢舉、回應一星客訴、過濾灌票…
經評估，目前團隊規模不適合上線即開放評價。
改採「已被多少顧客購買過」純計數，傳達熱度，不接受評論文字。

### 變更內容

#### 程式碼
- `product-detail.html`：
  - 移除 hero 內的 `.pd-rating`（5 顆星 + 4.9 + 186 則 + 已售 2347）
  - 改成新的 `.pd-buyers` pill：圖標 + 「2,347 位顧客買過」
  - 移除整個 `<section class="pd-reviews">`（含 3 則範例評論、分項條、看更多）
- `css/styles.css`：新增 `.pd-buyers` 樣式（pine 配色 pill）

#### 文件
- `docs/03-data-models.md`：
  - **移除** `Review` 模型完整定義
  - **移除** Product `hasMany reviews` 關聯
  - **移除** 模型清單裡的 Review
  - **新增** `Product.purchase_count` 欄位（int，計數，建議用 cached counter）
- `docs/02-api-contract.md`：
  - **移除** `POST /api/reviews` endpoint
  - 商品列表欄位 `rating / rating_count / sold_count` → 改為單一 `purchase_count`
  - 商品詳情 `reviews_summary` → 移除
  - 商品詳情 multi 欄位加 `manual_images`

### 對後端的影響
- **不用做** reviews 表、reviews CRUD、審核流程、檢舉
- **要做** products 加欄位 `purchase_count INT DEFAULT 0`
- **要做** 訂單付款成功時 +1（在 OrderObserver 或 webhook 處理）
- **要做** （或可選）每日排程重算一次校正快取

### 未來反悔成本
若日後改變主意要做評價系統，這份決策**不會卡住**：
- DB 可以再加 reviews 表
- API 可以再開 endpoint
- 前端 UI 已存在備份在 git 歷史（commit a36640e 之前）
但運營流程必須先準備好（誰回客訴、誰審檢舉）。

---

## 2026-04-29 — Product Manual（一頁式圖容器）

**作者：** 前端  
**影響面：** 前端 + 後端 + DBA  
**異動類型：** Non-breaking（新增功能）

### 變更內容
- `product-detail.html`：新增 Product Manual section（在商品故事和規格表之間）
  - 用真實 TFA 商品（productInfo/1071 宮北莓莓醋禮盒）的 7 張圖當 demo
  - 容器 max-width 880px 置中，圖片無間距堆疊
- `css/styles.css`：新增 `.pd-manual` / `.pd-manual-stack` / `.pd-manual-lightbox`
- `js/pd-manual.js`（新檔）：點圖開 lightbox，支援上下/左右鍵 + ESC + 點背景關閉
- `docs/03-data-models.md`：新增 ProductManualImage 模型，Product 加 hasMany manualImages
- `docs/09-templating-feasibility.md`：補上 Product Manual 區塊的 schema + Blade

### 給後端的新增
```sql
CREATE TABLE product_manual_images (
  id, product_id, sort_order,
  image_url, width, height, alt,
  INDEX (product_id, sort_order)
);
```

後台支援拖曳排序 + 多張圖批次上傳。

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
