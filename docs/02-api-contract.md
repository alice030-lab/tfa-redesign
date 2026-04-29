# 02 · API 合約

> **這份文件的目的：** 前端要呼叫的所有 endpoint 都列在這。
> **使用方式：** 後端開新 endpoint 前先看這份；異動時雙方在 PR 對齊。
> **路徑慣例：** 所有 API 都掛在 `/api/...` 之下，回傳 `application/json`。

---

## 共通規範

### 認證
- 登入後拿到 `token`，前端存 `localStorage.tfa_token`
- 每次帶 header：`Authorization: Bearer {token}`
- 401 回應 → 前端自動清 token、彈出登入框

### 回應格式

#### 成功（單筆）
```json
{
  "data": { ... }
}
```

#### 成功（列表 + 分頁）
```json
{
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "last_page": 8,
    "per_page": 20,
    "total": 156
  },
  "links": {
    "next": "/api/products?page=2",
    "prev": null
  }
}
```

#### 失敗（驗證錯誤 422）
```json
{
  "message": "資料驗證失敗",
  "errors": {
    "email": ["此 Email 已被註冊"],
    "password": ["密碼至少 8 碼"]
  }
}
```

#### 失敗（其他）
```json
{
  "message": "對外友善的錯誤訊息"
}
```

### 狀態碼
- `200` 成功
- `201` 建立成功（POST）
- `204` 刪除成功（無內容）
- `401` 未登入或 Token 失效
- `403` 已登入但沒權限
- `404` 資源不存在
- `422` 驗證錯誤
- `429` 太頻繁
- `500` 伺服器錯誤

### 日期格式
全站用 ISO 8601：`2026-04-29T10:30:00+08:00`

### 金額
整數新台幣，不含小數：`1200`（代表 NT$ 1,200）

---

## 🌐 公開 API（不需登入）

### 農友

#### `GET /api/farmers`
**Query 參數**
| 參數 | 型別 | 說明 |
|---|---|---|
| `region` | string | 篩選縣市（例：雲林） |
| `tag` | string | 篩選標籤（例：homecoming）|
| `featured` | bool | 只取本月農友誌 |
| `q` | string | 搜尋姓名 / 農場名 |
| `page` | int | 頁碼，預設 1 |
| `per_page` | int | 每頁筆數，預設 20、最大 50 |

**回應**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "ah-gan",
      "name": "阿甘",
      "farm_name": "波瑟沙植蓓農場",
      "region": "雲林",
      "location": "古坑鄉",
      "joined_year": 2019,
      "is_featured": true,
      "photo": {
        "url": "https://cdn.../farmer-1.jpg",
        "thumb": "https://cdn.../farmer-1-300.jpg",
        "alt": "阿甘"
      },
      "tags": ["homecoming", "organic"],
      "products_count": 12
    }
  ],
  "meta": { ... },
  "links": { ... }
}
```

#### `GET /api/farmers/{slug}`
回傳單一農友完整資料，**多帶** `story`（長文）、`gallery`（多張照片陣列）、`certifications`（認證標章）。

#### `GET /api/farmers/{slug}/products`
該農友的商品列表（response 跟 `/api/products` 相同 shape）。

---

### 商品

#### `GET /api/products`
**Query 參數**
| 參數 | 型別 | 說明 |
|---|---|---|
| `category` | string | 分類 slug（例：fruit） |
| `farmer` | string | 農友 slug |
| `brand` | string | 品牌 slug |
| `season` | string | 節氣 slug（例：guyu） |
| `q` | string | 搜尋商品名 |
| `sort` | enum | `latest` / `popular` / `price_asc` / `price_desc` |
| `min_price`, `max_price` | int | 價格區間 |
| `in_stock` | bool | 只顯示有庫存 |
| `page`, `per_page` | int | |

**回應**
```json
{
  "data": [
    {
      "id": 101,
      "slug": "longan-honey-1800g",
      "name": "台灣龍眼蜜",
      "spec": "1800g · 雲嘉南龍眼花期",
      "price": 1200,
      "strike_price": 1380,
      "stock": 28,
      "rating": 4.9,
      "rating_count": 186,
      "sold_count": 2347,
      "images": [
        { "url": "...", "thumb": "...", "alt": "正面" },
        { "url": "...", "thumb": "..." }
      ],
      "badges": ["seasonal", "best_seller"],
      "farmer": {
        "slug": "ah-gan",
        "name": "阿甘",
        "region": "雲林"
      },
      "brand": {
        "slug": "lovers-honey",
        "name": "情人蜂蜜"
      },
      "category": {
        "slug": "honey",
        "name": "蜂蜜"
      }
    }
  ],
  "meta": { ... },
  "links": { ... }
}
```

#### `GET /api/products/{slug}`
單一商品詳情，**多帶**：
- `description`（HTML，富文本）
- `specs`（規格選項陣列）
- `gallery`（多張照片）
- `nutrition`（營養標示）
- `reviews_summary`（5/4/3/2/1 星各幾則）
- `farmer_story_excerpt`（農友簡述）

#### `GET /api/products/{slug}/related`
相關商品 6-8 筆。後端決定演算法（同農友 / 同分類 / 同節氣）。

---

### 分類 / 內容

#### `GET /api/categories`
回傳完整分類樹，前端自己 render 成階層。
```json
{
  "data": [
    {
      "slug": "fresh",
      "name": "當季鮮食",
      "children": [
        { "slug": "vegetable", "name": "蔬菜" },
        { "slug": "fruit", "name": "水果" }
      ]
    }
  ]
}
```

#### `GET /api/articles`
**Query**：`type` (`spring` / `summer` / `autumn` / `winter` / `homecoming` / `2ndgen` / `legacy` / `mastery`)

#### `GET /api/articles/{slug}`
單篇文章，含 `body`（HTML）、`cover`、`author`、`published_at`、`related_products`。

#### `GET /api/seasons/{term}`
節氣對應的精選商品 + 文章。  
`term` ∈ `lichun` / `yushui` / `jingzhe` / ... / `dahan`（24 個節氣）

---

### 搜尋

#### `GET /api/search`
**Query**：`q`（必填）、`type`（`all` / `products` / `farmers` / `articles`）、`limit`

**回應**
```json
{
  "data": {
    "products": [ ...3-5 筆精簡 ],
    "farmers": [ ...3 筆精簡 ],
    "articles": [ ...3 筆精簡 ],
    "suggestions": ["愛文芒果", "玉井愛文"]
  }
}
```

---

### 表單

#### `POST /api/farmer-applications`
不需登入，農友申請表。
```json
// Request
{
  "name": "王大明",
  "phone": "0912345678",
  "email": "wang@example.com",
  "region": "南投",
  "farm_size": "2 公頃",
  "produce": "茶葉、蔬菜",
  "story": "..."
}
// Response 201
{ "data": { "id": 42, "status": "pending" } }
```

---

## 🔐 會員 API（需登入）

### 認證

#### `POST /api/auth/register`
```json
{ "email": "...", "password": "...", "name": "...", "phone": "..." }
```
回傳：`{ data: { user, token } }`

#### `POST /api/auth/login`
```json
{ "email": "...", "password": "..." }
```
回傳：`{ data: { user, token } }`

#### `POST /api/auth/logout`
需 token，回 204。

#### `GET /api/auth/me`
回傳當前登入者資料。

#### `POST /api/auth/forgot`
```json
{ "email": "..." }
```
無論 email 存不存在都回 200（避免被探測）。

#### `POST /api/auth/reset`
```json
{ "token": "...", "password": "..." }
```

---

### 購物車

#### `GET /api/cart`
回傳當前購物車內容。

#### `POST /api/cart/items`
```json
{ "product_id": 101, "qty": 2, "spec": "1800g" }
```

#### `PATCH /api/cart/items/{id}`
```json
{ "qty": 3 }
```

#### `DELETE /api/cart/items/{id}`
回 204。

#### `POST /api/cart/merge`
登入後把 localStorage 的內容合併進 DB。
```json
{ "items": [ { "product_id": 101, "qty": 2 }, ... ] }
```

---

### 地址

#### `GET /api/addresses`
#### `POST /api/addresses`
```json
{
  "recipient": "王小明",
  "phone": "0912345678",
  "zip": "640",
  "city": "雲林縣",
  "district": "古坑鄉",
  "street": "..."
}
```
#### `PATCH /api/addresses/{id}`
#### `DELETE /api/addresses/{id}`

---

### 訂單

#### `POST /api/orders`
```json
{
  "address_id": 5,
  "payment_method": "newebpay_credit",
  "note": "請週末送達"
}
```
回傳：
```json
{
  "data": {
    "order_no": "TFA20260429-0001",
    "total": 1380,
    "payment_url": "https://core.newebpay.com/..."   // 引導用戶到金流
  }
}
```

#### `GET /api/orders`
我的訂單列表。

#### `GET /api/orders/{order_no}`
訂單詳情。

---

### 評價

#### `POST /api/reviews`
```json
{
  "product_id": 101,
  "order_no": "TFA20260429-0001",
  "rating": 5,
  "body": "..."
}
```
**前端不要顯示「沒買過也能評」的入口**，後端會擋。

---

## ⚙️ 後台 API（需 admin 權限）

> 路徑前綴 `/api/admin/...`，前端對應「後台管理 UI」。

### 商品

| Method | Path | 用途 |
|---|---|---|
| GET | /api/admin/products | 列表（含未上架）|
| POST | /api/admin/products | 新增 |
| GET | /api/admin/products/{id} | 取單筆（編輯用，回完整欄位） |
| PATCH | /api/admin/products/{id} | 修改 |
| DELETE | /api/admin/products/{id} | 軟刪除 |
| POST | /api/admin/products/{id}/images | 上傳圖片（multipart/form-data） |
| DELETE | /api/admin/products/{id}/images/{img_id} | 刪除圖片 |

### 農友 / 文章 / 分類
依商品同樣模式，只是路徑改 `/farmers`、`/articles`、`/categories`。

### 訂單

| Method | Path | 用途 |
|---|---|---|
| GET | /api/admin/orders | 列表（多種篩選） |
| GET | /api/admin/orders/{order_no} | 詳情 |
| PATCH | /api/admin/orders/{order_no}/status | 改狀態（出貨 / 完成 / 取消） |
| POST | /api/admin/orders/{order_no}/refund | 退款 |

### 會員

| Method | Path | 用途 |
|---|---|---|
| GET | /api/admin/users | 列表 |
| GET | /api/admin/users/{id} | 詳情（含訂單） |
| PATCH | /api/admin/users/{id}/role | 改角色 |

### 申請

| Method | Path | 用途 |
|---|---|---|
| GET | /api/admin/applications | 待審列表 |
| PATCH | /api/admin/applications/{id} | 審核（approve / reject） |

### Dashboard

#### `GET /api/admin/dashboard`
```json
{
  "data": {
    "today": { "orders": 12, "revenue": 18900 },
    "month": { "orders": 384, "revenue": 562300 },
    "low_stock": [ { "product_id": 101, "name": "...", "stock": 3 } ],
    "best_sellers": [ ... ]
  }
}
```

---

## 一般洽詢

#### `POST /api/contact`
不需登入。前端來自 `contact.html` 的一般洽詢表單。

```json
// Request
{
  "name": "王小明",
  "email": "wang@example.com",
  "phone": "0912345678",       // 選填
  "topic": "商品 / 訂單問題",     // enum, 看下方
  "message": "..."
}

// Response 201
{ "data": { "id": 99, "received_at": "2026-04-29T10:30:00+08:00" } }
```

`topic` enum：
- `product_order` — 商品 / 訂單問題
- `return` — 退換貨
- `account` — 會員 / 帳號
- `bug` — 網站 bug 回報
- `other` — 其他

後端職責：
- 422 驗證（email 格式、message 長度）
- 寄通知信給 service@tfa.com.tw（依 topic 路由）
- 發送收件確認信給使用者
- 同 IP 1 小時內超過 5 次回 429

---

## 約定的「未來功能」placeholder

之後要做的，先在這留一行：

- `POST /api/coupons/validate`（折價券驗證）
- `GET /api/recommendations/me`（個人化推薦）
- `POST /api/notifications/subscribe`（電子報訂閱）
