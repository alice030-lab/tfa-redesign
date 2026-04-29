# 03 · 資料模型（前端視角）

> **這份文件的目的：** 前端從 UI 反推出來的資料結構草稿。
> **使用方式：** 後端 / DBA 用這個當基底設計 schema，需要調整就在這份留註記。
> **注意：** 這份不是 DB schema 本體，是前端期待消費的資料形狀。

---

## 模型清單

```
User              使用者（會員 + 農友 + 管理員）
FarmerProfile     農友會員的擴充欄位（multi-tenant 用，見 07）
Farmer            農友
Product           商品
ProductDraft      商品草稿（自助上架用，見 07）
Category          分類
Brand             品牌
Article           文章
Season            節氣
Order             訂單
OrderItem         訂單品項
Address           地址
Cart              購物車
CartItem          購物車品項
Review            評價
FarmerApplication 農友申請（join-farmer.html / contact.html#join）
ContactMessage    一般洽詢訊息（contact.html）
Media             圖片 / 影片統一表（見 08）
Image             圖片（值物件，常作 JSON 嵌入）
```

---

## 模型細節

### User
```
id              bigint, PK
email           string, unique
password        string, hashed（前端不會看到）
name            string
phone           string?
role            enum('customer', 'admin', 'super_admin')
email_verified  bool
avatar          Image?
created_at, updated_at
```

### Farmer
```
id              bigint, PK
slug            string, unique（網址用：'ah-gan'）
name            string                     例：阿甘
farm_name       string?                    例：波瑟沙植蓓農場
region          string                     例：雲林（縣市）
location        string?                    例：古坑鄉
joined_year     int                        例：2019
photo           Image
gallery         Image[]                    多張照片
story           text                       長文（HTML / Markdown）
story_excerpt   string                     摘要（120 字）
certifications  string[]                   ['organic', 'tap_certified']
tags            string[]                   ['homecoming', '2ndgen', 'legacy', 'mastery'] 任選
is_featured     bool                       本月農友誌
sort_order      int
created_at, updated_at

關聯：
  hasMany products
```

### Product
```
id              bigint, PK
slug            string, unique
sku             string?, unique
name            string
spec            string                     例：1800g · 雲嘉南龍眼花期
description     text                       商品描述（HTML）
price           int                        現價
strike_price    int?                       原價（劃掉）
cost            int?                       成本（admin only）
stock           int
weight_g        int?                       重量（克）
images          Image[]                    主圖 + 其他
badges          string[]                   ['seasonal', 'best_seller', 'new']
status          enum('draft', 'published', 'archived')
sort_order      int
created_at, updated_at

關聯：
  belongsTo farmer
  belongsTo brand?
  belongsToMany categories
  belongsToMany seasons
  hasMany reviews
```

### Category
```
id              bigint, PK
slug            string, unique
name            string
parent_id       bigint?, FK → categories
icon            string?
sort_order      int

關聯：
  hasMany children (self)
  belongsToMany products
```

### Brand
```
id              bigint, PK
slug            string, unique
name            string                     例：情人蜂蜜
name_en         string?                    例：Lover's Honey
logo            Image?
hero            Image?
description     text?

關聯：
  hasMany products
```

### Article
```
id              bigint, PK
slug            string, unique
type            enum('spring', 'summer', 'autumn', 'winter',
                     'homecoming', '2ndgen', 'legacy', 'mastery',
                     'general')
title           string
cover           Image
excerpt         string
body            text                       HTML / Markdown
author          string?
published_at    datetime?
related_products  Product[]                pivot
related_farmers   Farmer[]                 pivot
created_at, updated_at
```

### Season（節氣）
```
id              bigint, PK
slug            string                     例：'guyu'
name            string                     例：穀雨
date_label      string                     例：'Apr 20'
season          enum('spring', 'summer', 'autumn', 'winter')
order_in_year   int                        1-24
description     text?

關聯：
  belongsToMany products
  hasMany articles (where type matches season slug)
```

### Order
```
id              bigint, PK
order_no        string, unique             例：'TFA20260429-0001'
user_id         bigint, FK → users
status          enum('pending', 'paid', 'preparing', 'shipped',
                     'delivered', 'cancelled', 'refunded')
subtotal        int
shipping_fee    int
discount        int
total           int
payment_method  enum('newebpay_credit', 'newebpay_atm', 'cod')
payment_ref     string?                    金流交易序號
paid_at         datetime?
shipped_at      datetime?
tracking_no     string?
note            string?
address_snapshot  json                     下單當下的地址快照
created_at, updated_at

關聯：
  belongsTo user
  hasMany items
```

### OrderItem
```
id              bigint, PK
order_id        bigint, FK → orders
product_id      bigint, FK → products
qty             int
unit_price      int
subtotal        int
product_snapshot  json                     下單當下的商品快照（名稱、圖、規格）
```

### Address
```
id              bigint, PK
user_id         bigint, FK → users
recipient       string
phone           string
zip             string
city            string
district        string
street          string
is_default      bool
```

### Cart
```
id              bigint, PK
user_id         bigint?, FK → users        未登入也可以有（用 session_id）
session_id      string?
expires_at      datetime?

關聯：
  hasMany items
```

### CartItem
```
id              bigint, PK
cart_id         bigint, FK → carts
product_id      bigint, FK → products
qty             int
spec            string?                    選的規格
```

### Review
```
id              bigint, PK
product_id      bigint, FK → products
user_id         bigint, FK → users
order_id        bigint, FK → orders        確認真的買過
rating          int                        1-5
body            text
images          Image[]?
status          enum('pending', 'published', 'hidden')
created_at, updated_at
```

### FarmerApplication
```
id              bigint, PK
name            string
phone           string
email           string
region          string
farm_size       string?
produce         string?
story           text
status          enum('pending', 'reviewing', 'approved', 'rejected')
submitted_at    datetime
reviewed_by     bigint?, FK → users
reviewed_at     datetime?
notes           text?
```

### ContactMessage
來自 contact.html 的一般洽詢表單。
```
id              bigint, PK
name            string
email           string
phone           string?
topic           enum('product_order','return','account','bug','other')
message         text
ip              string                    防濫用紀錄
user_agent      string?
status          enum('new','assigned','replied','closed')
assigned_to     bigint?, FK → users       哪個客服處理
replied_at      datetime?
notes           text?                     內部備註
created_at, updated_at
```

### Image（值物件 / JSON 結構）
不一定是獨立資料表，可以是 JSON 欄位或關聯表。前端期待的 shape：
```json
{
  "url":   "https://cdn.tfa.com.tw/images/xxx.jpg",
  "thumb": "https://cdn.tfa.com.tw/images/xxx-300.jpg",
  "alt":   "alt 文字"
}
```

---

## 索引建議（給 DBA 參考）

| 表 | 欄位 | 用途 |
|---|---|---|
| users | email | 登入查詢 |
| farmers | slug | 網址查詢 |
| farmers | region, is_featured | 列表篩選 |
| products | slug | 網址查詢 |
| products | farmer_id, status | 該農友的上架商品 |
| products | status, sort_order | 列表預設排序 |
| orders | user_id, status | 我的訂單 |
| orders | order_no | 訂單查詢 |
| reviews | product_id, status | 商品頁讀評價 |

---

## 跟既有 DB 整合的注意事項

> 已知 DB 是延用先前的，schema 可改。建議：

1. **整理一份既有表清單**（DBA 提供 `SHOW TABLES;` 輸出），標出哪些可以直接套用、哪些要改名 / 改欄位。
2. **欄位命名統一 snake_case**（Laravel 慣例），如果既有不是，可以用 model 的 `$casts` / accessor 處理。
3. **時間欄位統一 `created_at` / `updated_at`**，如果既有不是，加上 mapping。
4. **軟刪除欄位 `deleted_at`** 於商品 / 文章 / 農友這些「不該真刪」的表。
5. **多語欄位**（如果未來要做多語）可用 JSON：`name: { "zh-TW": "...", "en": "..." }`。
