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
