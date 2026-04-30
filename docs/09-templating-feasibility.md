# 09 · 模板化可行性盤點

> **這份文件的目的：** 把現有靜態 HTML 變動態（SSR）時，**哪些區塊好做、哪些難做、哪些直接放棄做模板**。
> **使用方式：** 後端排 schema 前先看這份；前端設計新區塊時也先 review。
> **配套：** 03-data-models.md（資料模型）、02-api-contract.md（API 形狀）。

---

## 1. 三色分級

```
🟢 容易模板化         平面欄位、標準關聯，後端 join + Blade 迴圈即可
🟡 可模板但要彈性結構  必須做 1:N 子表，或用富文本，編輯後台要進化
🔴 實質做不到完全模板  每筆都要編輯介入 / 美術介入，或乾脆改設計
```

---

## 2. farmer-detail.html 區塊盤點

### 🟢 容易模板（後端 + Blade 直接對應）

| 區塊 | 對應欄位 | 備註 |
|---|---|---|
| Topbar / Nav / Breadcrumb / Footer | layout 共用 | Blade 用 `@extends` |
| Hero 平面欄位 | `name`, `farm_name`, `region`, `location`, `quote`, `portrait`, `years_collab`, `years_growing`, `method`, `category` | 都是 `farmers` 表的單一欄位 |
| Products 區塊 | products WHERE farmer_id | 標準 hasMany |
| Films / Shorts | media WHERE attachable + type | 標準 morphMany |
| Related Farmers | 演算法決定 | 同地區 / 同分類 / 隨機 |
| CTA strip | `name` 套字串 | 「想收到 {{ $farmer->name }} 的消息？」 |

### 🟡 可模板但必須做 1:N 子表

#### A. STORY 專訪（Q&A）

```sql
farmer_qas (
  id              bigint PK
  farmer_id       FK → farmers
  sort_order      int
  question        varchar(200)
  answer_html     longtext       -- 富文本，含 <blockquote class="fd-pull"> 等內嵌標記
)
```

**Blade：**
```blade
@foreach($farmer->qas as $i => $qa)
  <section id="q{{ $i+1 }}" class="fd-qa">
    <h3 class="fd-q">Q｜{{ $qa->question }}</h3>
    {!! $qa->answer_html !!}
  </section>
@endforeach
```

**TOC 動態：**
```blade
<aside class="fd-toc">
  <ol>
    @foreach($farmer->qas as $i => $qa)
      <li><a href="#q{{ $i+1 }}">{{ $qa->question }}</a></li>
    @endforeach
  </ol>
</aside>
```

**重要：** 編輯後台必須是富文本編輯器（TinyMCE / TipTap），讓編輯能在文中插入：
- `<p class="fd-a fd-dropcap">` 首字放大段落
- `<blockquote class="fd-pull">` 內文引言
- `<strong>` 重點強調

不能用 plain `<textarea>` 讓編輯打 markdown — 客戶不會用。

#### B. Gallery「農場一日」

```sql
farmer_galleries (
  id              bigint PK
  farmer_id       FK → farmers
  title           varchar(200)        例：「從日出到日落，茶園裡在發生什麼事」
  subtitle        varchar(200) NULL
)

farmer_gallery_items (
  id              bigint PK
  gallery_id      FK → farmer_galleries
  sort_order      int
  caption         varchar(100)        例：「清晨 6 點 · 巡園」
  image_url       varchar(500)
  alt             varchar(200)
)
```

**為什麼要這樣：** 阿甘是「日出到日落」、羊頭目可能是「育嬰房 → 牧場 → 擠奶」、追花人是「晨採 → 移動 → 包裝」。標題與 caption 因人而異。

#### C. AT-A-GLANCE 策展數字條

```sql
farmer_glances (
  id              bigint PK
  farmer_id       FK → farmers
  sort_order      int
  value           varchar(20)         字串，因可能是 '0' / '3.2' / '560'
  unit            varchar(20) NULL    '公頃' / '°C' / '頭'，可空
  label           varchar(50)         '茶園' / '冷壓溫度' / '羊頭數'
)
```

**為什麼不能固定 5 欄：** 標籤完全因人而異
- 阿甘（茶）：樹齡 / 化學藥劑 / 公頃 / 海拔 / 採摘次數
- 羊頭目（牧場）：羊頭數 / 飼養天數 / 品種數 / 乳量 / 飼料原產地
- 追花的人（蜂蜜）：遷徙公里數 / 蜂箱數 / 採蜜次數 / 花季種類 / 純度

**Blade：**
```blade
@foreach($farmer->glances as $g)
  <div class="fd-glance-item">
    <span class="num">{{ $g->value }}</span>
    @if($g->unit)<span class="unit">{{ $g->unit }}</span>@endif
    <span class="lbl">{{ $g->label }}</span>
  </div>
@endforeach
```

### 🔴 實質做不到完全模板

#### A. Hero 印章「波 / 瑟沙」直書

```html
<span class="stamp fh-seal">波<br>瑟沙</span>
```

**問題：** 換成「羊頭目」要拆「羊 / 頭目」？「羊頭 / 目」？「胡麻先生」要拆「胡麻 / 先生」？  
這個「斷字位置」是設計判斷，每位都要編輯決定。

**可行做法（用斷字符儲存）：**

```sql
farmers ADD seal_text VARCHAR(20)
-- 用 | 標斷行：
--   阿甘 → '波|瑟沙'
--   羊頭目 → '羊頭|目'
--   胡麻先生 → '胡麻|先生'
--   或 NULL（不顯示印章）
```

**Blade：**
```blade
@if($farmer->seal_text)
  <span class="stamp fh-seal">
    {!! str_replace('|', '<br>', e($farmer->seal_text)) !!}
  </span>
@endif
```

#### B. LOCATION 內嵌 SVG 地圖 → 已決策拿掉

```
原設計：手繪 SVG 地圖 + 紅點 + 座標
問題：  每位農友地形不同，等於每位都要設計師重畫一張 SVG
        (12 位 × 1 天/位 = 12 天美術工)

決策（2026-04-29）：方案 D — 直接拿掉地圖
保留：  座標數字、4 行重點（氣候/土壤/水源/鄰居）、產地敘述
        用單欄置中限寬呈現
```

**已實作於 farmer-detail.html `.fd-loc-grid--single`。**

未來若要恢復「視覺化地形」可考慮：
- 方案 B：Google Maps / Leaflet（座標自動 → 失去手繪風格）
- 方案 C：「台灣島輪廓 + 一個 pin」通用 SVG 模板（用 lat/lng 算 pin 位置）

---

## 3. product-detail.html 區塊盤點

### 🟢 容易

- Hero（圖庫 / 規格選擇 / 加購、購買人數 pill）
- Spec Table（規格 / 保存 / 認證）
- Related Products
- Product Video

### 🟡 富文本欄位

- `products.description` HTML 內容
- `products.tagline` ⭐ 新加 — 「四月下旬，我們跟著龍眼花走了一千公里」這種詩意主標，每件商品要一句獨特

### 🔴 必須 1:N

#### Product Manual「產品敘述一頁式圖」

```sql
product_manual_images (
  id              bigint PK
  product_id      FK → products
  sort_order      int
  image_url       varchar(500)
  width, height   int?
  alt             varchar(200)
)
```

**為什麼是這個結構：**
農友會自己做長條 EDM / 一頁式宣傳圖（看真實案例：[宮北莓莓醋禮盒](https://www.tfa.com.tw/productInfo/1071) 上傳了 7 張）。每件商品的張數從 1 到 20+ 都有可能。

**Blade：**
```blade
@if($product->manualImages->isNotEmpty())
  <section class="pd-manual">
    <div class="container">
      <div class="pd-manual-stack">
        @foreach($product->manualImages as $img)
          <img src="{{ $img->image_url }}" alt="{{ $img->alt ?? '產品介紹 '.$loop->iteration }}" loading="lazy">
        @endforeach
      </div>
    </div>
  </section>
@endif
```

**前端容器規則：**
- `max-width: 880px` 置中（一般 EDM 設計尺寸）
- 圖片之間 0 間距（多張通常是接續設計）
- 點圖開 lightbox（已實作於 `js/pd-manual.js`）

---

## 4. 後端必須增加的 schema 整理（給後端清單）

### 既有表加欄位

```sql
ALTER TABLE farmers
  ADD COLUMN seal_text VARCHAR(20) NULL,         -- 印章直書文字，用 | 標斷行
  ADD COLUMN years_collab INT NULL,              -- 合作年資
  ADD COLUMN years_growing INT NULL,             -- 種植年資
  ADD COLUMN method VARCHAR(50) NULL,            -- 耕作方式
  ADD COLUMN category VARCHAR(50) NULL,          -- 分類（匠人 / 返鄉 / ...）
  ADD COLUMN lat DECIMAL(10,7) NULL,             -- 座標，地圖拿掉但仍存
  ADD COLUMN lng DECIMAL(10,7) NULL;

ALTER TABLE products
  ADD COLUMN tagline VARCHAR(200) NULL;          -- 商品故事主標
```

### 新增 4 張子表

```sql
-- Q&A 訪談
CREATE TABLE farmer_qas (
  id BIGINT PK AUTO_INCREMENT,
  farmer_id BIGINT NOT NULL,
  sort_order INT DEFAULT 0,
  question VARCHAR(200) NOT NULL,
  answer_html LONGTEXT NOT NULL,
  created_at, updated_at,
  INDEX (farmer_id, sort_order)
);

-- 農場一日 gallery
CREATE TABLE farmer_galleries (
  id BIGINT PK AUTO_INCREMENT,
  farmer_id BIGINT NOT NULL UNIQUE,
  title VARCHAR(200),
  subtitle VARCHAR(200) NULL,
  created_at, updated_at
);

CREATE TABLE farmer_gallery_items (
  id BIGINT PK AUTO_INCREMENT,
  gallery_id BIGINT NOT NULL,
  sort_order INT DEFAULT 0,
  caption VARCHAR(100),
  image_url VARCHAR(500),
  alt VARCHAR(200),
  INDEX (gallery_id, sort_order)
);

-- 策展數字條
CREATE TABLE farmer_glances (
  id BIGINT PK AUTO_INCREMENT,
  farmer_id BIGINT NOT NULL,
  sort_order INT DEFAULT 0,
  value VARCHAR(20) NOT NULL,
  unit VARCHAR(20) NULL,
  label VARCHAR(50) NOT NULL,
  INDEX (farmer_id, sort_order)
);

-- 產品敘述一頁式圖
CREATE TABLE product_manual_images (
  id BIGINT PK AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  sort_order INT DEFAULT 0,
  image_url VARCHAR(500) NOT NULL,
  width INT NULL,
  height INT NULL,
  alt VARCHAR(200) NULL,
  created_at, updated_at,
  INDEX (product_id, sort_order)
);
```

---

## 5. 編輯後台必須具備的功能（給後端 / PM）

### 富文本編輯器
**必裝：** TinyMCE / TipTap / CKEditor 任一個。  
**自訂按鈕：**
- 「插入內文引言」→ 包 `<blockquote class="fd-pull">...</blockquote>`
- 「首字放大」→ 對段落加 `class="fd-dropcap"`
- 「重點強調」→ 一般 `<strong>`
- 「圖片插入」→ 從媒體庫選

> 沒有富文本，就沒辦法產出真正像 demo 那種編輯精緻的內容頁。

### 拖曳排序
- farmer_qas / farmer_galleries / farmer_glances / product_manual_images 都要支援拖曳調順序
- Laravel 後台用 `nestablejs` / Filament 內建的 sortable

### 印章斷字預覽
- 編輯填 seal_text 時即時預覽（直書 + 換行）
- 提示「用 | 標示換行位置」

### 必填 vs 選填
| 必填 | 選填（可空） |
|---|---|
| name, region, slug, portrait, quote | seal_text, story, qas, galleries, glances |

> ⚠️ 即使「不必填」，沒填欄位的區塊在前端也要 Blade 加 `@if` 判斷不渲染，避免空白區塊。

---

## 6. 內容策略建議

### 第一波（5 位種子農友）

每位農友編輯產出：
- ✅ 必填欄位（hero、故事 1 段、3 件商品）
- ✅ 1 組 Q&A（4 題）
- ⚠️ Gallery（4 張時序照片 + caption）
- ⚠️ Glances（5 組策展數字）
- ⚠️ 印章斷字

預估每位農友編輯成本：1-2 個工作天（含採訪、攝影、剪輯、上稿）。

### 後續農友

逐步補完。**沒寫滿欄位的農友**，前端 Blade 加 `@if` 判斷該區塊不渲染：

```blade
@if($farmer->qas->isNotEmpty())
  <section class="fd-story">...</section>
@endif

@if($farmer->galleries)
  <section class="fd-gallery">...</section>
@endif

@if($farmer->glances->isNotEmpty())
  <section class="fd-glance">...</section>
@endif
```

> **這個策略叫「漸進式內容」** — 完整資料的農友頁面豐富、初期農友頁面精簡，但都不會壞。

---

## 7. 給後端同事的 TL;DR

```
做得到（標準）：
  ─ 90% 的 farmer / product 欄位
  ─ 圖片、商品、影片關聯
  
做得到但要寫額外子表：
  ─ farmer_qas             （訪談）
  ─ farmer_galleries       （農場一日 + items）
  ─ farmer_glances         （策展數字條）
  ─ product_manual_images  （商品敘述一頁式圖）

需要編輯後台升級：
  ─ 富文本編輯器（含自訂按鈕）
  ─ 拖曳排序

放棄做模板（已決策拿掉）：
  ─ farmer-detail 的 SVG 手繪地圖（2026-04-29）
  ─ farmer-detail 的 LOCATION 整個區塊（2026-04-29）
  ─ product-detail 的 Traceability Timeline（2026-04-29）
  ─ product-detail 的評價系統 → 改顯示「N 位顧客買過」（2026-04-29）
```
