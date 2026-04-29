# TFA 開發文件

此資料夾為 **前端工程師視角** 的開發文件。

## 文件導覽

| 檔案 | 給誰看 | 內容 |
|---|---|---|
| `01-scope-split.md` | 全員必讀 | 前端 / 後端 / DBA 的職責分界、誰負責什麼 |
| `02-api-contract.md` | **後端必讀** | 前端需要的 API endpoint 清單（請求格式、回傳 JSON shape） |
| `03-data-models.md` | 後端、DBA | 前端期待的資料結構（給 DB schema 設計參考） |
| `04-frontend-guide.md` | 前端、未來接手者 | 本地開發、檔案結構、命名規範、JS / CSS / HTML 守則、踩坑紀錄 |
| `05-deploy-handoff.md` | DevOps、後端 | 前端產物如何上線、靜態資源伺服路徑、CORS 設定 |
| `06-changelog.md` | 全員 | 每次改 API 合約 / 資料模型必須記錄 |
| `07-farmer-marketplace.md` | 後端、產品 | 多租戶（農友自助上架）平台規格 |
| `08-media-strategy.md` | 後端、前端 | 影片走 YouTube、圖片走 Cloudflare 的混合方案 |
| `09-templating-feasibility.md` | **後端 + 編輯後台必讀** | 哪些區塊好做模板、哪些要開子表、哪些放棄 |

## 推薦閱讀順序

**新加入的後端同仁：**
1. `01-scope-split.md`（30 分鐘） — 知道誰做什麼
2. `02-api-contract.md`（1-2 小時） — 真正要實作的 endpoint 清單
3. `03-data-models.md`（1 小時） — 跟既有 DB schema 比對
4. `07-farmer-marketplace.md`（1 小時） — 多租戶模型
5. `08-media-strategy.md`（30 分鐘） — 影片 / 圖片決策

**新加入的前端：**
1. `04-frontend-guide.md` — 直接照著開工
2. `02-api-contract.md` — 知道 API 長什麼樣
3. 其他依需求查

## 分工總覽（一頁速查）

```
┌─────────────────────────────────────────────────────────────┐
│  前端                                                          │
│  ├─ 18 頁 HTML / CSS / JS（含 contact.html 統一聯絡頁）         │
│  ├─ UI 互動、動畫、RWD                                         │
│  ├─ 串接 API（fetch）                                          │
│  ├─ Form 即時驗證（UX）                                        │
│  ├─ localStorage / sessionStorage                              │
│  ├─ YouTube Lite Embed（.tfa-yt 元件）                         │
│  ├─ 稻穗 loading 動畫                                          │
│  ├─ 漢堡選單 + Mega menu                                       │
│  └─ 圖片優化 pipeline（scripts/optimize-images.js）            │
│                                                                │
│      ↕ 透過 HTTP / JSON 對話                                   │
│                                                                │
│  後端                                                          │
│  ├─ API endpoints（公開 + 會員 + farmer + admin）              │
│  ├─ 業務邏輯（價格、庫存、訂單流轉、分潤）                     │
│  ├─ 多角色認證（customer / farmer / admin / super_admin）      │
│  ├─ 資料驗證（最終把關）                                        │
│  ├─ 草稿 → 審核 → 發布流程                                      │
│  ├─ 金流串接 / 寄信 / 排程                                      │
│  ├─ YouTube oEmbed 整合                                         │
│  └─ DB 讀寫                                                     │
│                                                                │
│  資料庫（MySQL）                                                │
│  ├─ Schema 設計（見 03-data-models.md）                        │
│  ├─ Migration / Seed                                           │
│  ├─ 索引、效能調校                                              │
│  └─ 備份                                                        │
└─────────────────────────────────────────────────────────────┘
```

## 溝通協定

1. **API 合約異動 → 必須先發 PR 改 `02-api-contract.md`**，雙方同意後再動程式碼。
2. **新增功能 → 先在 `06-changelog.md` 開條目**，列出影響面。
3. **緊急修復可以先動程式碼**，但 24 小時內補文件。

## 環境

| 環境 | 前端網址 | API base | 備註 |
|---|---|---|---|
| 本地 | `http://localhost:5174` | `http://localhost:8000/api` | http-server + Laravel artisan serve |
| 預覽（GitHub Pages）| `https://alice030-lab.github.io/tfa-redesign/` | （無，純靜態 demo）| 自動部署 main |
| 測試 | `https://stg.tfa.com.tw` | `https://api-stg.tfa.com.tw/api` | 提交 PR 自動部署 |
| 正式 | `https://tfa.com.tw` | `https://api.tfa.com.tw/api` | 走主流程 release |

## 技術棧

```
前端：  純 HTML + CSS + 原生 JS（無框架，無 build 流程）
後端：  PHP 8.3 + Laravel 11
DB：    MySQL 8
媒體：  YouTube（影片）+ Cloudflare R2 / Image Transformations（圖片）
寄信：  Resend
部署：  自架 EC2 / VPS（Nginx + PHP-FPM）
```
