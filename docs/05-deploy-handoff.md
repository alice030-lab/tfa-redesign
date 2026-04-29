# 05 · 部署 & 交接

> **這份文件的目的：** 前端產出怎麼上線、後端怎麼接、上線設定。

---

## 1. 前端產物說明

目前是**純靜態網站**，沒有 build 流程。
- 直接把整個 repo 拷到 web server document root 即可
- 入口：`index.html`
- 所有 asset 路徑都是相對：`css/styles.css`、`js/loader.js`、`images/...`

未來如果遷到 Astro / Vite，會有 `dist/` 資料夾才是真正上線的內容。

---

## 2. 部署目標選項

### 方案 A：靜態 + 後端分離（建議）
```
前端：       https://tfa.com.tw       靜態網站
後端 API：   https://api.tfa.com.tw   PHP / Laravel 機器
```
**好處：** 各自獨立部署、CDN 友善、前端可以用 Cloudflare Pages 免費。

### 方案 B：同一台機器
```
https://tfa.com.tw/         前端靜態
https://tfa.com.tw/api/...  後端 API（Nginx reverse proxy 到 PHP）
```
**好處：** 不用處理 CORS、設定簡單。

**目前先用方案 B 開發，上線時再評估要不要切。**

---

## 3. Web server 設定範例

### Nginx + 同機 PHP（方案 B）
```nginx
server {
    listen 443 ssl http2;
    server_name tfa.com.tw;

    root /var/www/tfa-redesign;
    index index.html;

    # 前端靜態
    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # API 反向代理到 Laravel（假設 8000 port）
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 靜態資源 cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
}
```

### CORS（如果走方案 A，前後端分網域）
後端 Laravel 在 `config/cors.php`：
```php
'paths' => ['api/*'],
'allowed_origins' => ['https://tfa.com.tw'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,   // 如果用 cookie session
```

---

## 4. 環境變數對照

前端 `js/api.js` 開頭：
```js
const API_BASE = location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : '/api';   // 上線後同域名
```

後端（讓後端同仁知道前端會送什麼）：
```env
APP_URL=https://tfa.com.tw
SANCTUM_STATEFUL_DOMAINS=tfa.com.tw
SESSION_DOMAIN=.tfa.com.tw
CORS_ALLOWED_ORIGINS=https://tfa.com.tw
```

---

## 5. 圖片 / 檔案上傳

### 前端送
```js
const fd = new FormData();
fd.append('file', fileInput.files[0]);
fd.append('alt', '商品正面照');

await TFA.api.post('/admin/products/123/images', fd);
// 注意：FormData 不要設 Content-Type，瀏覽器會自動帶 boundary
```

### 後端期待儲存
- 開發：local disk（`storage/app/public/products/...`）
- 正式：S3 / R2（透過 Laravel Filesystem driver）
- 回傳前端：完整 URL（含 host），不是 relative path

### 圖片尺寸建議
| 用途 | 尺寸 | 格式 |
|---|---|---|
| 商品主圖 | 1200×1500 (4:5) | JPG quality 85 |
| 商品縮圖 | 400×500 | JPG quality 80 |
| 農友肖像 | 800×1000 (4:5) | JPG quality 85 |
| 文章封面 | 1600×900 (16:9) | JPG quality 85 |
| 後台預覽 | 200×200 | JPG quality 75 |

後端可用 `intervention/image` 自動產出多尺寸。

---

## 6. 寄信模板

前端不負責寄信，但模板樣式可以幫忙做（HTML email）。

需求清單：
- 註冊歡迎信
- Email 驗證信
- 忘記密碼信
- 訂單成立信
- 訂單出貨通知
- 退貨確認信

如果要做：放在 `email-templates/` 資料夾，純 HTML + inline CSS（email 不支援外部 CSS）。

---

## 7. 監控 & 錯誤回報

### 前端
- console.error 在開發環境留著
- 正式環境用 Sentry（之後再裝，先預留 hook）：
  ```js
  // js/error-tracker.js（未實作）
  window.addEventListener('error', e => { /* send to Sentry */ });
  window.addEventListener('unhandledrejection', e => { /* ... */ });
  ```

### 後端職責
- API 5xx 錯誤要記 log
- 慢查詢監控
- 排程任務失敗通知

---

## 8. 交接清單

### 給後端同仁的東西
- [ ] 這份 `docs/` 全部
- [ ] 前端 repo 讀取權限
- [ ] 已知的「假資料」清單（哪些是寫死的）
- [ ] 各頁面的 wireframe / 設計稿（如有）

### 從後端同仁要的東西
- [ ] API base URL（dev / stg / prod）
- [ ] 測試帳號（一般會員 + admin）
- [ ] Postman collection / Swagger 連結
- [ ] DB ER 圖
- [ ] 部署用的環境變數列表

### 共同要對的事
- [ ] CORS 設定
- [ ] Token 存放方式（localStorage vs httpOnly cookie）
- [ ] 圖片 URL 格式（相對 / 絕對 / CDN）
- [ ] 分頁參數慣例（page / per_page）
- [ ] 排序參數慣例（`sort=latest` 或 `sort_by=created_at&sort_order=desc`）
- [ ] 日期 format（ISO 8601）
- [ ] 錯誤回應格式

---

## 9. 第一次串接的 Smoke Test

兩邊各自完成第一個 endpoint 後，跑這個確認：

```
□ 前端在 console 跑：
  fetch('/api/farmers').then(r => r.json()).then(console.log)
  → 看到 200 + 資料

□ 帶 token：
  fetch('/api/auth/me', { headers: { Authorization: 'Bearer xxx' }})
  → 200 + user 物件

□ 故意送錯：
  fetch('/api/products', { method: 'POST', body: '{}' })
  → 401 / 422，且 body 是約定的 { message, errors } 格式

□ CORS 通：
  在 https://tfa.com.tw console 對 https://api.tfa.com.tw 發請求
  → 沒有 CORS error
```
