# TFA 開發文件

此資料夾為 **前端工程師視角** 的開發文件。

## 文件導覽

| 檔案 | 給誰看 | 內容 |
|---|---|---|
| `01-scope-split.md` | 全員必讀 | 前端 / 後端 / DBA 的職責分界、誰負責什麼 |
| `02-api-contract.md` | **後端必讀** | 前端需要的 API endpoint 清單（請求格式、回傳 JSON shape） |
| `03-data-models.md` | 後端、DBA | 前端期待的資料結構（給 DB schema 設計參考） |
| `04-frontend-guide.md` | 前端、未來接手者 | 本地開發、檔案結構、命名規範、JS / CSS / HTML 守則 |
| `05-deploy-handoff.md` | DevOps、後端 | 前端產物如何上線、靜態資源伺服路徑、CORS 設定 |
| `06-changelog.md` | 全員 | 每次改 API 合約 / 資料模型必須記錄 |

## 分工總覽（一頁速查）

```
┌─────────────────────────────────────────────────────────────┐
│  前端（你）                                                    │
│  ├─ 17 頁 HTML / CSS / JS                                     │
│  ├─ UI 互動、動畫、RWD                                         │
│  ├─ 串接 API（fetch）                                          │
│  ├─ Form 即時驗證（UX）                                         │
│  ├─ localStorage / sessionStorage                              │
│  └─ 圖片優化 pipeline（scripts/optimize-images.js）             │
│                                                                │
│      ↕ 透過 HTTP / JSON 對話                                    │
│                                                                │
│  後端（同仁）                                                   │
│  ├─ API endpoints                                              │
│  ├─ 業務邏輯（價格計算、庫存扣減、訂單流轉）                    │
│  ├─ 認證（Token / Session）                                    │
│  ├─ 資料驗證（最終把關）                                        │
│  ├─ 金流串接 / 寄信 / 排程                                      │
│  └─ DB 讀寫                                                    │
│                                                                │
│  資料庫（同仁或 DBA）                                           │
│  ├─ Schema 設計                                                │
│  ├─ Migration / Seed                                           │
│  ├─ 索引、效能調校                                              │
│  └─ 備份                                                       │
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
| 測試 | `https://stg.tfa.com.tw` | `https://api-stg.tfa.com.tw/api` | 提交 PR 自動部署 |
| 正式 | `https://tfa.com.tw` | `https://api.tfa.com.tw/api` | 走主流程 release |
