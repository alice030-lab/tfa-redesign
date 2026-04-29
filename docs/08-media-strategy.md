# 08 · 媒體策略（影片 + 圖片）

> **這份文件的目的：** 影片走 YouTube、圖片自架的混合策略，把架構、API、農友教學都寫清楚。
> **核心決策：** 影片用 YouTube（免費 + SEO + 不用伺服器），圖片用 Cloudflare R2 / Images（多尺寸 + CDN）。

---

## 1. 為什麼這樣分

| 媒體 | 方案 | 主要原因 |
|---|---|---|
| **影片** | YouTube（不公開）| 免費、轉檔串流自動、農友自己會傳、順便做 SEO 與品牌 |
| **圖片** | Cloudflare R2 + Image Transformations | YouTube 不收圖；多尺寸需要 on-the-fly resize；CDN 速度 |

---

## 2. 影片策略：YouTube（不公開）

### 2.1 流程

```
農友              網站後台              你的 DB                YouTube
────              ────────              ──────                 ────────
拍片              
↓
上傳到 YouTube ────────────────────────────────────────────→  建立影片
（選「不公開」）                                                 取得 video_id
↓
複製網址 ────→  貼上「YouTube 網址」欄位
                ↓
                正規表達式抽 video_id
                ↓
                存進 media.youtube_id ──→  media 表新增記錄
                                          (provider='youtube')
                ↓
前端讀資料 ←────────────────────────  以 video_id 組
                                       縮圖 / 內嵌 URL
↓
顯示縮圖 + 播放按鈕
↓
用戶點擊 → 站內 iframe 播放
```

### 2.2 三種 YouTube 隱私設定（給農友的教學）

| 設定 | 說明 | 何時用 |
|---|---|---|
| **公開** Public | YouTube 搜尋會出現，頻道列表也看得到 | 想用 YouTube 做 SEO、希望更多人找到時 |
| **不公開** Unlisted ⭐ | 有網址才看得到，YouTube 內搜不到 | **預設都選這個**，獨家感、不被搜尋 |
| 私人 Private | 只有你指定的 Google 帳號才看得到 | 不要選，網站訪客會看不到 |

> 後台貼網址欄位旁的提示文字：
> **「請將 YouTube 影片設為『不公開』，這樣只有透過台灣鮮農網站才能播放這支影片。」**

### 2.3 資料表變動

`media` 表新增 / 修改：

```sql
ALTER TABLE media
  ADD COLUMN provider ENUM('upload','youtube') NOT NULL DEFAULT 'upload',
  ADD COLUMN youtube_id VARCHAR(20) NULL,
  ADD COLUMN duration_sec INT NULL,        -- YouTube oEmbed 抓回來
  ADD COLUMN thumbnail_url VARCHAR(500) NULL;
```

> `image_*` 和 `video_id` 欄位變成 nullable（不一定每筆都用）。

### 2.4 後端解析 YouTube 網址（PHP）

```php
// app/Support/YouTube.php
class YouTube {
    /**
     * 從各種 YT 網址抽出 11 碼影片 ID
     * 支援:
     *   https://youtu.be/dQw4w9WgXcQ
     *   https://www.youtube.com/watch?v=dQw4w9WgXcQ
     *   https://www.youtube.com/embed/dQw4w9WgXcQ
     *   https://www.youtube.com/shorts/dQw4w9WgXcQ
     *   https://m.youtube.com/watch?v=dQw4w9WgXcQ
     *   裸 ID: dQw4w9WgXcQ
     */
    public static function extractId(string $url): ?string {
        $url = trim($url);
        // 直接是 11 碼 ID
        if (preg_match('~^[A-Za-z0-9_-]{11}$~', $url)) return $url;
        // 從各種網址抽
        if (preg_match('~(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/|shorts/|v/))([A-Za-z0-9_-]{11})~i', $url, $m)) {
            return $m[1];
        }
        return null;
    }
    
    /** 用 oEmbed 撈 title / thumbnail / duration（不用 API key） */
    public static function fetchMeta(string $videoId): ?array {
        $url = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={$videoId}&format=json";
        $res = @file_get_contents($url);
        if (!$res) return null;
        $data = json_decode($res, true);
        return [
            'title' => $data['title'] ?? null,
            'thumbnail' => $data['thumbnail_url'] ?? "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg",
            'author' => $data['author_name'] ?? null,
        ];
    }
    
    public static function thumbnailUrl(string $videoId, string $quality = 'maxres'): string {
        // 可用值：default / mqdefault / hqdefault / sddefault / maxresdefault
        $key = $quality === 'maxres' ? 'maxresdefault' : "{$quality}default";
        return "https://img.youtube.com/vi/{$videoId}/{$key}.jpg";
    }
    
    public static function watchUrl(string $videoId): string {
        return "https://www.youtube.com/watch?v={$videoId}";
    }
    
    public static function embedUrl(string $videoId, array $opts = []): string {
        $params = array_merge(['rel' => 0, 'modestbranding' => 1], $opts);
        return "https://www.youtube.com/embed/{$videoId}?" . http_build_query($params);
    }
}
```

### 2.5 後端 API（影片新增）

```
POST /api/seller/media/youtube       # 農友新增 YT 影片
Body:
{
  "url": "https://youtu.be/dQw4w9WgXcQ",
  "attachable_type": "product",
  "attachable_id": 123,
  "caption": "阿甘的龍眼蜜採收實錄"
}

→ 後端流程：
   1. extractId(url) → "dQw4w9WgXcQ"，失敗回 422
   2. fetchMeta(id)  → 取 title / thumbnail / duration（撈不到也沒關係）
   3. 存進 media 表 provider='youtube', youtube_id=...
   4. 回 201 + media 物件

Response 201:
{
  "data": {
    "id": 456,
    "provider": "youtube",
    "youtube_id": "dQw4w9WgXcQ",
    "title": "阿甘的龍眼蜜採收實錄",
    "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "watch_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "embed_url": "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    "duration_sec": null,
    "caption": "阿甘的龍眼蜜採收實錄"
  }
}
```

### 2.6 前端使用

#### 顯示影片區塊（HTML）

```html
<div class="tfa-yt" 
     data-id="dQw4w9WgXcQ" 
     data-title="阿甘的龍眼蜜採收實錄"
     role="button"
     aria-label="播放影片：阿甘的龍眼蜜採收實錄"
     tabindex="0">
  <img class="tfa-yt-thumb" 
       src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" 
       alt="阿甘的龍眼蜜採收實錄"
       loading="lazy">
  <button class="tfa-yt-play" type="button" aria-label="播放">
    <svg viewBox="0 0 68 48" aria-hidden="true">
      <path d="M66.5 7.7c-.8-2.9-3-5.2-5.9-6C55.4.5 34 .5 34 .5S12.6.5 7.4 1.7c-2.9.8-5.1 3.1-5.9 6C.4 12.9.4 24 .4 24s0 11.1 1.1 16.3c.8 2.9 3 5.2 5.9 6 5.2 1.2 26.6 1.2 26.6 1.2s21.4 0 26.6-1.2c2.9-.8 5.1-3.1 5.9-6 1.1-5.2 1.1-16.3 1.1-16.3s0-11.1-1.1-16.3z" fill="#f00"/>
      <path d="M27 34V14l18 10z" fill="#fff"/>
    </svg>
  </button>
  <span class="tfa-yt-caption">阿甘的龍眼蜜採收實錄</span>
</div>
```

點擊邏輯由 `js/tfa-youtube.js` 統一處理（事件委派）。

#### Lite-Embed vs 外連 YouTube

| 模式 | HTML 加什麼 | 行為 |
|---|---|---|
| **站內播放（推薦）** | `<div class="tfa-yt" data-id="...">` | 點擊 → 原地換 iframe → 內嵌播放器 |
| **連到 YouTube** | 加 `data-link="external"` | 點擊 → `window.open()` 到 youtube.com |

#### 列表縮圖（小卡片）

```html
<a class="tfa-yt-card" 
   href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
   target="_blank" rel="noopener"
   data-id="dQw4w9WgXcQ">
  <div class="tfa-yt-card-thumb">
    <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg" alt="">
    <span class="tfa-yt-card-play">▶</span>
  </div>
  <h4 class="tfa-yt-card-title">阿甘的龍眼蜜採收實錄</h4>
  <span class="tfa-yt-card-meta">3:24 · 阿甘</span>
</a>
```

### 2.7 縮圖 URL 對照

YouTube 縮圖直接組路徑就有，不需 API key：

| 尺寸 | URL | 說明 |
|---|---|---|
| 默認 | `https://img.youtube.com/vi/{ID}/default.jpg` | 120×90，太小 |
| 中等 | `https://img.youtube.com/vi/{ID}/mqdefault.jpg` | 320×180，列表用 |
| 高清 | `https://img.youtube.com/vi/{ID}/hqdefault.jpg` | 480×360 |
| 標清 | `https://img.youtube.com/vi/{ID}/sddefault.jpg` | 640×480 |
| **最高** | `https://img.youtube.com/vi/{ID}/maxresdefault.jpg` | **1280×720**，主圖用 |

> ⚠️ 並非所有影片都有 `maxresdefault.jpg`（要影片本身 ≥720p 才產出）。前端可加 fallback：
> `onerror="this.src='https://img.youtube.com/vi/{ID}/hqdefault.jpg'"`

### 2.8 注意事項

- 影片若被作者刪除，縮圖會變成 YouTube 灰底「影片不可用」圖。建議後端排程定期 ping oEmbed API，發現 404 就標記 media.status = 'broken' 並寄 email 提醒農友。
- 「不公開」連結等同於密碼，只要被分享就到處傳得開；真正機密內容不能用 YT。
- iframe 一旦載入就會載 YouTube 的 JS / cookies；用 lite-embed 模式可以延後到使用者點擊才載入。

---

## 3. 圖片策略：Cloudflare R2 + Image Transformations

### 3.1 為什麼不用 YouTube / 免費圖床

| 方案 | 為什麼不選 |
|---|---|
| YouTube | 不收圖片 |
| Imgur | 不穩定、可能被當廣告擋 |
| Google Drive 直連 | 流量限制、不能用作 CDN |
| 自家 PHP server 直存 | 大流量會打掛、無法 on-the-fly resize |

### 3.2 流程

```
農友 / admin 上傳圖片
   ↓ multipart POST /api/seller/media/image
   或 直傳 signed URL（避免 PHP timeout）
   ↓
你的後端：
   • 驗證 mime / 大小
   • 存到 Cloudflare R2 bucket
   • 寫 media 表（image_url）
   ↓
前端要不同尺寸時：
   image_url + ?w=400&h=500&fit=cover
   → Cloudflare Images Transformation 即時生成 + cache
```

### 3.3 月費（規模小時近免費）

| 服務 | 免費額度 | 超出後 |
|---|---|---|
| Cloudflare R2 儲存 | 10 GB | $0.015/GB |
| Cloudflare R2 流量出 | **不收費** | 永遠免費 |
| Image Transformations | 5K transformations/day | $0.5/1K |
| Image Delivery | 100K images/月 | $0.5/100K |

**TFA 規模（1 萬張圖、月 PV 5 萬）月費接近 NT$ 0。**

### 3.4 圖片尺寸標準（後端產或前端要求都用這個）

| 用途 | 尺寸 | 比例 | 格式 |
|---|---|---|---|
| 商品主圖 | 1200×1500 | 4:5 | JPG q85 |
| 商品縮圖 | 400×500 | 4:5 | JPG q80 |
| 商品列表卡片 | 600×750 | 4:5 | JPG q82 |
| 農友肖像（大）| 800×1000 | 4:5 | JPG q85 |
| 農友肖像（小）| 200×250 | 4:5 | JPG q80 |
| 文章封面 | 1600×900 | 16:9 | JPG q85 |
| 文章列表縮圖 | 480×270 | 16:9 | JPG q80 |
| OG 分享圖 | 1200×630 | OG | JPG q85 |

### 3.5 前端使用 srcset

```html
<img 
  src="https://imagedelivery.net/xxx/abc/w=600,h=750,fit=cover,q=82,f=auto"
  srcset="https://imagedelivery.net/xxx/abc/w=400,h=500,fit=cover,q=82,f=auto 400w,
          https://imagedelivery.net/xxx/abc/w=800,h=1000,fit=cover,q=82,f=auto 800w"
  sizes="(min-width: 1024px) 33vw, 50vw"
  alt="台灣龍眼蜜"
  loading="lazy">
```

`f=auto` 會自動回傳 AVIF / WebP / JPG 中最適合該瀏覽器的格式。

---

## 4. 後台農友教學文（請後端寫進後台 help / FAQ）

### 上傳影片（YouTube）

```
1. 用手機或相機拍好你想分享的影片
2. 用 Google 帳號登入 https://youtube.com
3. 點右上角「上傳影片」
4. 拖檔上傳
5. 隱私設定請選「不公開」
6. 上傳完成後複製網址（手機點「分享」可以複製）
7. 回到台灣鮮農後台 → 我的商品 → 編輯
8. 在「影片」欄位貼上 YouTube 網址
9. 儲存

⚠️ 影片網址範例：
   ✅ https://youtu.be/abc12345678
   ✅ https://www.youtube.com/watch?v=abc12345678
   ❌ https://www.youtube.com/channel/...（這是頻道網址不是影片）
```

### 上傳圖片

```
1. 後台 → 我的商品 → 編輯
2. 點「+ 新增圖片」
3. 從手機相簿選圖（建議 1200×1500 直式）
4. 上傳會自動完成裁切與壓縮
5. 一個商品最多 8 張圖
```

---

## 5. 給後端同仁的實作 Checklist

### 影片
- [ ] 在 `media` 表加 `provider`, `youtube_id`, `thumbnail_url`, `duration_sec` 欄位
- [ ] 寫 `App\Support\YouTube` helper（見 2.4）
- [ ] `POST /api/seller/media/youtube` endpoint：抽 ID + 撈 oEmbed + 存 DB
- [ ] 排程任務：每天 ping 所有 YT 影片，掛掉的標記 broken
- [ ] 後台 / 前端 API 回傳時組好 `watch_url` / `embed_url` / `thumbnail_url`

### 圖片
- [ ] 申請 Cloudflare R2 bucket + API token
- [ ] 接 `Storage::disk('r2')`（Laravel filesystem）
- [ ] `POST /api/seller/media/image` 接收 multipart 並丟到 R2
- [ ] （進階）改用 R2 signed URL 讓前端直傳，避免 PHP 處理大檔
- [ ] 啟用 Image Transformations / 接 Cloudflare Images

---

## 6. 後續可能的擴充

- 影片做 watermark / 浮水印 → Cloudflare Stream（付費）
- 直播 → YouTube Live + 內嵌
- 360 度產地全景 → Pannellum（純前端 JS lib）
- 短影音 Reels 風格 → 改用 Cloudflare Stream + 自家播放器
