# 07 · 農友自助上架平台（Multi-tenant Marketplace）

> **這份文件的目的：** 把網站從「後台管理員上架」升級成「農友自己上架 + 管理員審核」的多租戶平台規格。
> **核心轉變：** 從 admin-only CMS → seller marketplace pattern。
> **相依：** 03-data-models.md（資料模型）、08-media-strategy.md（影片走 YouTube、圖片走 R2）。

---

## 1. 為什麼要做

```
原本（admin-only）:                 現在（marketplace）:
─────────────────────              ─────────────────────
admin 在後台幫農友上架               農友自己上架 → 管理員審核 → 公開
admin 改商品 / 價格                 農友改自己的商品（限制範圍內）
admin 看所有訂單                    農友只看自己的訂單
admin 處理出貨                      農友自填出貨單號
```

帶來的好處：擴大規模不需要等 admin 排程；農友有歸屬感；資料正確性提高。
帶來的成本：權限模型、草稿 / 審核流程、防呆機制、農友教學。

---

## 2. 角色升級

```
users.role: enum
├─ customer        一般會員（買東西）
├─ farmer          農友（自己上架 + 看自己銷售）
├─ admin           內部管理員（審核農友、處理跨農友訂單）
└─ super_admin     最高權限（管管理員、改設定）
```

### 新增關聯表：`farmer_profiles`

只有 `role=farmer` 的 user 才有：
```sql
farmer_profiles (
  id              bigint PK
  user_id         FK → users (1:1)
  farmer_id       FK → farmers (1:1)        對應到展示用的農友資料
  status          enum('pending','active','suspended')
  commission_rate decimal(5,2)              分潤百分比，預設 15.00
  bank_account    encrypted text            對帳匯款用
  approved_at     datetime?
  approved_by     FK → users
  created_at, updated_at
)
```

> ⚠️ 隱私：`bank_account` 必須加密儲存（Laravel `encrypted` cast）。

---

## 3. 完整流程

```
 ① 註冊申請                ② 管理員審核            ③ 設定商家頁
 ───────────              ───────────             ───────────
 join-farmer.html          admin 看清單            農友登入後
 → applications 表          → approve              → 完整填農場資料
                            → 自動開 farmer 帳號     → 上傳肖像 / 故事
                            → 寄歡迎信 + 預設密碼

                                ↓

 ⑥ 公開上架                ⑤ 管理員審核            ④ 建立商品草稿
 ───────────              ───────────              ───────────
 published                 pending → approved       農友 dashboard
 進前台 listing             admin 看清單檢查          建草稿、傳圖、
                            或退件 (rejected)         傳影片、寫描述

                                ↓ 上架後可繼續編輯
                                ↓
 ⑦ 訂單通知              ⑧ 出貨                   ⑨ 對帳 / 分潤
 ───────────             ───────────              ───────────
 寄 email + 站內通知       農友自填出貨單號          月結報表
 (有訂單啦！)              改狀態 → shipped          匯款 / 開發票
```

---

## 4. 資料表變動

### 新增

```sql
-- 商品草稿（送審前的工作版本）
product_drafts (
  id              bigint PK
  product_id      FK → products NULL    null 代表新建草稿
  farmer_id       FK → farmers
  payload         json                  商品所有欄位的 JSON 快照
  status          enum('draft','pending','approved','rejected')
  reviewed_by     FK → users
  reviewed_at     datetime?
  reject_reason   text?
  submitted_at    datetime?
  created_at, updated_at
)

-- 審核紀錄（每次提交 / 退件 / 通過都留軌跡）
approval_records (
  id              bigint PK
  draft_id        FK → product_drafts
  action          enum('submit','approve','reject','revise')
  by_user_id      FK → users
  note            text?
  created_at
)
```

### 修改 `products`

```sql
ALTER TABLE products
  ADD COLUMN farmer_id       BIGINT NOT NULL,         -- 必填，限制擁有者
  ADD COLUMN status          ENUM('draft','pending','published','archived','suspended')
                             NOT NULL DEFAULT 'draft',
  ADD COLUMN published_at    DATETIME NULL,
  ADD CONSTRAINT fk_products_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id);
```

### 修改 `orders`

```sql
ALTER TABLE orders
  ADD COLUMN farmer_payout_total INT DEFAULT 0,        -- 該訂單農友應分多少
  ADD COLUMN payout_status ENUM('pending','paid','disputed') DEFAULT 'pending',
  ADD COLUMN payout_paid_at DATETIME NULL;
```

> 訂單可能涉及多個農友（一張訂單跨多家商品），所以 `farmer_payout_total` 是該訂單需要分給「所有相關農友」的總額。實際分到每一個農友的金額由 `order_items` 的快照計算（參考 03-data-models §OrderItem）。

---

## 5. 權限規則（後端 Policy）

> 後端在每個 endpoint 都要套這套 policy，前端只是 UI 隱藏，**不能當成安全機制**。

### Farmer 角色
- 讀寫：只能存取 `farmer_id = auth()->user()->farmer_profile->farmer_id` 的資料
- 商品：只能改自己擁有的商品；改完進 `pending` 狀態，等 admin 審
- 訂單：只能看自己商品被買走的訂單（透過 `order_items.product.farmer_id`）
- 統計：只看自己的數字

### Admin 角色
- 讀寫：所有資料
- 商品：可代農友編輯（要記 `edited_by`）、批准 / 退件草稿
- 訂單：跨農友檢視 + 改狀態
- 農友：核可申請、停權、改分潤

### Super Admin
- 讀寫：包含 admin 帳號管理
- 系統設定：feature flags、結帳開關

---

## 6. API endpoints

### 農友自助 `/api/seller/...`

| Method | Path | 用途 |
|---|---|---|
| GET | /api/seller/dashboard | 業績概覽（今日 / 本月、待出貨數、評價星等）|
| GET | /api/seller/profile | 我的農場資料（給編輯用，回完整欄位）|
| PATCH | /api/seller/profile | 更新農場資料 |
| GET | /api/seller/products | 我的商品列表（含 draft / pending）|
| GET | /api/seller/products/{id} | 單筆編輯資料 |
| POST | /api/seller/products | 新增（→ draft）|
| PATCH | /api/seller/products/{id} | 編輯草稿（→ draft）|
| POST | /api/seller/products/{id}/submit | 送審（draft → pending）|
| POST | /api/seller/products/{id}/withdraw | 撤回送審（pending → draft）|
| DELETE | /api/seller/products/{id} | 刪除（軟刪）|
| GET | /api/seller/orders | 我的訂單 |
| PATCH | /api/seller/orders/{order_no}/ship | 填出貨單號 |
| GET | /api/seller/payouts | 我的對帳記錄 |
| **媒體上傳** | | |
| POST | /api/seller/media/image | 圖片上傳（multipart 或 signed URL）|
| POST | /api/seller/media/youtube | 提交 YouTube URL（內部抽 video_id）|
| DELETE | /api/seller/media/{id} | 刪除媒體 |

### 管理員審核 `/api/admin/...`（在 02-api-contract 已列基本，這裡補 marketplace 專屬）

| Method | Path | 用途 |
|---|---|---|
| GET | /api/admin/drafts?status=pending | 待審核草稿列表 |
| POST | /api/admin/drafts/{id}/approve | 核可（→ products.published）|
| POST | /api/admin/drafts/{id}/reject | 退件（含理由）|
| GET | /api/admin/farmer-applications | 農友申請列表（已存在）|
| POST | /api/admin/farmer-applications/{id}/approve | 核可 → 開帳號 + 寄信 |
| GET | /api/admin/payouts | 月結對帳清單 |
| POST | /api/admin/payouts/{id}/pay | 標記已匯款 |

---

## 7. 前端頁面（前端待開發）

### 新增頁面（前端尚未做）

| 路徑 | 對應 API | 內容 |
|---|---|---|
| `seller-dashboard.html` | GET /api/seller/dashboard | 業績圖表、待辦事項 |
| `seller-products.html` | GET /api/seller/products | 我的商品列表 + 新增按鈕 |
| `seller-product-edit.html` | GET/PATCH /api/seller/products/{id} | 編輯表單 + 圖片管理 + YT 影片貼網址 |
| `seller-orders.html` | GET /api/seller/orders | 訂單列表 + 出貨輸入 |
| `seller-payouts.html` | GET /api/seller/payouts | 月結帳明細 |

### 共用元件（待寫）

- `js/auth.js` — 登入 / 登出 / Token 管理（含 farmer 角色判斷）
- `js/seller-uploader.js` — 圖片拖曳上傳元件
- 後端表單範本：規格選項、營養標示、產地、認證

---

## 8. 風險與防呆

### 防止農友亂改價

- 草稿價格改動超過 ±20% 必須加註理由
- admin 看草稿時 highlight 改動欄位

### 防止重複送審

- 同一個 product_id 只能有一筆 `pending` 草稿
- 送審時前端 disable 按鈕並 polling 狀態

### 防止假資料 / 違規內容

- 文字欄位過 keyword filter（敏感詞清單）
- 圖片過 NSFW detection（之後接 Cloudflare AI 或 SightEngine）
- 第一個月新農友自動進「加強審核」群組（要 admin 核每筆）

### 防止鑽漏洞改別人商品

- 後端每個 seller endpoint 必須 `Gate::authorize('manage', $product)`，policy 檢查 `$product->farmer_id === auth()->user()->farmer_profile->farmer_id`
- 不依賴前端的 hidden field

---

## 9. 工時估算（後端視角）

| 項目 | 工時 |
|---|---|
| 多角色權限模型 + 認證 | 3d |
| farmer_profiles 表 + 申請審核流程 | 2d |
| product_drafts 表 + 審核流程 | 3d |
| seller dashboard API | 1d |
| seller products CRUD API | 2d |
| seller orders API + 出貨流程 | 2d |
| 媒體上傳（圖片 + YouTube）API | 2d |
| 對帳 / 分潤計算 | 3d |
| admin 審核 dashboard API | 2d |
| **小計（後端）** | **20 工作天** |

| 項目 | 工時 |
|---|---|
| 5 個 seller-*.html 頁面 + 樣式 | 5d |
| 圖片上傳元件（drag/drop, progress） | 1.5d |
| Token / auth.js | 0.5d |
| Form validation + UX | 1d |
| **小計（前端）** | **8 工作天** |

**整體 marketplace：約 28 工作天**（不含 UAT / bug）。

---

## 10. 上線分階段

```
Phase 1 (MVP)      開放 5-10 位種子農友手動匯入
                   ── 無 self-upload，admin 代上架，但前端展示已經是
                      multi-tenant data shape

Phase 2 (Self-onboarding 開放)
                   ── 開放農友自助上架草稿
                   ── admin 後台補審核功能
                   ── 防止濫用：第一個月「強審核模式」

Phase 3 (規模化)    ── 對帳自動化
                   ── 統計圖表豐富化
                   ── 開放農友自助看評價並回覆
```
