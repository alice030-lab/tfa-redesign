# 12 · SEO Playbook（永久 SOP）

> **這份文件的目的：** 一份可重複套用的 SEO 工作手冊。  
> 不只給 TFA 這個案子用，**任何 web 案子都可以照這份做**。  
> 不是「學術文」，是「**做事流程 + 為什麼這樣做**」。

---

## 0. 心法

> **SEO 不是把網站給機器看；是用機器看得懂的方式，把網站介紹給人。**

搜尋引擎（Google）對你的網站來說是**盲人**：
- 看不到設計、動畫、品牌色
- 只讀 HTML 文字 + 結構
- JS 跑出來的東西它**會看但慢**且不一定準

所以 SEO 的本質：**用 HTML 把意思「翻譯」給機器**。

```
你看到（眼睛）：           Google 看到（讀 HTML）：
─────────────              ─────────────────
漂亮 hero 圖               <h1> 寫什麼
品牌色                     <title> / <meta>
故事很感動                  文字 + 連結結構
判斷「專業」                判斷「主題」「值不值得排前面」
```

---

## 1. 五步驟工作流

每個案子照這 5 步做：

```
Step 1  量現況         grep / curl 掃出 title / meta / canonical 等狀況
Step 2  分級           P0 / P1 / P2 排優先序
Step 3  腳本化         寫 inject-seo.js 而不是手動改 N 次
Step 4  上線後動作     提交 Search Console、跑 Rich Results Test
Step 5  3-6 個月回看  看實際搜尋詞、寫對應內容
```

---

## 2. Step 1：量現況（10 分鐘掃完）

**永遠先量再做。** 不要憑感覺。

### 必跑的 6 條 grep

```bash
# 1. <title> 檢查
for f in *.html; do
  t=$(grep -oE '<title>[^<]+</title>' "$f" | sed 's/<[^>]*>//g')
  echo "  $f → $t  (${#t} 字)"
done

# 2. meta description 檢查
for f in *.html; do
  d=$(grep -oE '<meta name="description" content="[^"]+"' "$f" | sed 's/.*content="//;s/"$//')
  [ -z "$d" ] && echo "  ❌ $f → 沒 description"
done

# 3. <h1> 數量（每頁應該 1 個）
for f in *.html; do
  c=$(grep -cE '<h1[ >]' "$f")
  [ "$c" -ne 1 ] && echo "  ⚠️  $f → $c 個 h1"
done

# 4. canonical URL
grep -L 'rel="canonical"' *.html

# 5. Open Graph / Twitter
for f in *.html; do
  og=$(grep -c 'property="og:' "$f")
  [ "$og" -eq 0 ] && echo "  ❌ $f → 沒 OG"
done

# 6. 必要 SEO 檔
for f in robots.txt sitemap.xml favicon.ico manifest.json; do
  [ -f "$f" ] && echo "  ✅ $f" || echo "  ❌ MISSING: $f"
done
```

把結果整理成表格，看出問題分布在哪。

---

## 3. Step 2：P0 / P1 / P2 分級

**永遠先做 P0。** P2 沒做不會死，P0 沒做網站等於不存在。

### 🔴 P0 — Google 完全看不到你（**必修**）

| 項目 | 為什麼 P0 |
|---|---|
| robots.txt | 沒這個爬蟲不知道哪些可爬 |
| sitemap.xml | 沒這個 Google 要靠連結爬，會漏 |
| 爛 / 開發用 title | 會直接顯示在 Google 結果頁 |
| `<html lang="zh-TW">` | 沒這個 Google 不確定語言 |
| 缺 `<meta charset>` | 中文會亂碼 |

### 🟠 P1 — Google 看到但理解錯（**強烈建議**）

| 項目 | 為什麼 P1 |
|---|---|
| canonical URL | 防重複內容稀釋權重 |
| Open Graph | 社群分享預覽空白 = 0 點擊 |
| Twitter Card | 同上 |
| meta description | 不影響排名但影響點擊率 |
| noindex 給不該爬的頁 | 結帳 / 後台不該出現在搜尋結果 |
| favicon | 信任感、品牌一致 |

### 🟡 P2 — Google 看得懂但給不了 rich snippet（**錦上添花**）

| 項目 | 為什麼 P2 |
|---|---|
| JSON-LD 結構化資料 | 結果頁顯示星等 / 麵包屑 / 價格 |
| 圖片 alt | a11y + 圖搜流量 |
| h1 補關鍵字 | 主題訊號加強 |
| Core Web Vitals | 微幅排名加分 |
| 內鏈結構 | 權重傳遞 |

### 🟢 P3 — 進階（**有需要再做**）

- hreflang（多語）
- AMP（已過時，不推薦）
- preconnect / dns-prefetch
- 結構化麵包屑

---

## 4. Step 3：每個 SEO 元素的「為什麼」

光會抄 code 沒用。你要懂**機器看到後是怎麼用的**，才寫得對。

### 4.1 `<title>` — Google 結果頁的藍色標題

```
搜尋結果上的呈現：
  [台灣鮮農 · 200+ 認證農友直送]   ← <title>（可點藍字）
  https://tfa.com.tw                ← URL
  [從 2019 年開始...]               ← description（灰字）
```

**寫法守則：**
- **長度**：英文 50-60 字 / 中文 25-30 字（超過會被 Google 截斷）
- **格式**：`主關鍵字 · 副關鍵字 — 品牌`
- **位置**：主關鍵字放最前面（權重最高）
- **避免**：開發用詞「測試」「預覽」「TODO」

```
✅ 好範例：
   台灣龍眼蜜 1800g · 雲嘉南穀雨春釀 — 情人蜂蜜
   ↑主關鍵字     ↑副關鍵字／屬性    ↑品牌

❌ 壞範例：
   首頁                       ← 太空泛，沒關鍵字
   首頁 - 改版預覽（測試）      ← 開發用詞
   買 蜂蜜 龍眼蜜 春釀 雲嘉南 情人蜂蜜 NT$1200 免運 SGS  ← 關鍵字塞太滿
```

### 4.2 `<meta name="description">` — 不影響排名但影響點擊

**迷思破除：description 不是排名信號**（Google 早 2009 年就講了）。  
但它**顯示在搜尋結果灰字區**，影響：點擊率 → 點擊率影響排名（間接）。

**寫法：**
- 120-160 字元
- 包含關鍵字（會被 Google 加粗）
- 寫得像「為什麼要點進來」的廣告詞
- 帶數字 / 福利更有用

```
✅ 好範例：
  「200+ 認證農友、18 縣市產地直送。每件食材都看得到名字。
   滿 NT$ 999 免運、48 小時到家，新會員首購折 200。」
   ─ 含關鍵字、含信任數字、含 CTA
```

### 4.3 `<link rel="canonical">` — 防重複內容

**問題：** 同一頁可能有多個 URL：
```
https://tfa.com.tw/farmers
https://tfa.com.tw/farmers/
https://tfa.com.tw/farmers?ref=line
https://tfa.com.tw/farmers?utm_source=fb
www.tfa.com.tw/farmers
tfa.com.tw/farmers
```

對 Google 來說這是 **6 個不同的頁**。權重被分散，排名上不去。

**解法：**
```html
<link rel="canonical" href="https://tfa.com.tw/farmers.html">
```
等於跟 Google 說：「不管使用者從哪個 URL 進來，**這個才是正版**，把訊號歸給它。」

**規則：** 每頁的 canonical 都指向自己（絕對 URL）。

### 4.4 Open Graph + Twitter Card — 社群分享卡片

當有人把你的網址貼到 Line / FB / X / IG / Slack：

```
沒做 OG：    [空白縮圖] 標題 + URL    ← 沒人想點
有做 OG：    [大張預覽圖]
            標題（粗體）
            描述（兩行）
            tfa.com.tw                ← 看起來專業、想點
```

**最少要加 7 條：**
```html
<meta property="og:type" content="website">         <!-- 或 article / product / profile -->
<meta property="og:title" content="...">             <!-- 同 <title> 即可 -->
<meta property="og:description" content="...">       <!-- 同 description -->
<meta property="og:url" content="https://tfa.com.tw/farmers.html">
<meta property="og:image" content="https://tfa.com.tw/og/farmers.jpg">  <!-- 1200×630 -->
<meta property="og:site_name" content="台灣鮮農 TFA">
<meta property="og:locale" content="zh_TW">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="...">
```

**og:image 規格：**
- 尺寸 1200×630（推薦）
- 格式 JPG（PNG 也行，但檔案小一點）
- 大小 < 1MB
- **重要**：放網站絕對 URL，不要相對路徑

### 4.5 robots.txt — 給爬蟲的禁區告示牌

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout.html
Disallow: /preview.html
Disallow: /api/
Disallow: /*?utm_     ← 防 utm 追蹤碼變成新 URL

Sitemap: https://yoursite.com/sitemap.xml
```

**重點：**
- 不該被爬的頁（後台 / 結帳）一定要 Disallow
- 結尾一定要寫 sitemap 位置
- AI 爬蟲（GPTBot / ClaudeBot）可選擇 Allow 或 Disallow

### 4.6 sitemap.xml — 全站地圖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tfa.com.tw/</loc>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
    <lastmod>2026-04-30</lastmod>
  </url>
  ...
</urlset>
```

**priority 怎麼定（0.0 - 1.0）：**
- `1.0` 首頁
- `0.9` 主要 hub（about / 商品 / 農友）
- `0.7-0.8` 次要分類頁
- `0.5` 個別商品 / 農友
- `0.3` 法務頁

**changefreq：** `daily` / `weekly` / `monthly` / `yearly`（爬蟲參考用，不是強制）

### 4.7 JSON-LD 結構化資料 — Rich Snippet 解鎖

加了之後**搜尋結果可能變漂亮**：
- 商品旁邊出現星等 / 價格
- 麵包屑取代 URL 列
- 文章顯示作者 / 日期 / 縮圖

**最常用的 6 種：**

```html
<!-- Organization：放首頁 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "台灣鮮農 TFA",
  "url": "https://tfa.com.tw",
  "logo": "https://tfa.com.tw/logo.png",
  "sameAs": [
    "https://www.facebook.com/tfa",
    "https://www.youtube.com/channel/..."
  ]
}
</script>

<!-- BreadcrumbList：每個非首頁都該有 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首頁", "item": "https://tfa.com.tw/" },
    { "@type": "ListItem", "position": 2, "name": "農友", "item": "https://tfa.com.tw/farmers.html" },
    { "@type": "ListItem", "position": 3, "name": "阿甘" }
  ]
}
</script>

<!-- Product：商品頁 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "台灣龍眼蜜 1800g",
  "image": "https://tfa.com.tw/images/honey-01.jpg",
  "description": "...",
  "brand": { "@type": "Brand", "name": "情人蜂蜜" },
  "offers": {
    "@type": "Offer",
    "price": "1200",
    "priceCurrency": "TWD",
    "availability": "https://schema.org/InStock"
  }
}
</script>

<!-- Article：故事 / Journal 文章 -->
<!-- Person：農友個人頁 -->
<!-- LocalBusiness：實體店面 / 農場 -->
```

**驗證工具：** https://search.google.com/test/rich-results

### 4.8 favicon + manifest — 信任感與 PWA

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#c8402a">
```

```json
// manifest.json
{
  "name": "台灣鮮農 TFA",
  "short_name": "台灣鮮農",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8f4ec",
  "theme_color": "#c8402a",
  "icons": [...]
}
```

---

## 5. Step 3：自動化 — 寫腳本而非手動

**禁止手動改 24 個 HTML 加 OG meta**。會出錯、難維護。

### 通用注入腳本

寫一支 `scripts/inject-seo.js`：
- 自動讀每頁的 `<title>` / `description`
- 套同一個模板產出 SEO block
- **idempotent**（可重跑）：偵測舊 block 自動覆蓋
- 後端遷移時把這套搬到 Blade `@yield('seo')` 即可

範例（TFA 案實際使用）：見 `scripts/inject-seo.js`。

---

## 6. Step 4：上線後 24 小時必做

```
□ 1. 註冊 Google Search Console
     https://search.google.com/search-console
     提交 sitemap.xml

□ 2. 註冊 Bing Webmaster Tools
     https://www.bing.com/webmasters
     提交 sitemap.xml（佔台灣搜尋約 5%）

□ 3. 設定 GA4
     https://analytics.google.com
     裝 gtag.js

□ 4. 跑 Rich Results Test 驗證 JSON-LD
     https://search.google.com/test/rich-results

□ 5. 跑 PageSpeed Insights
     https://pagespeed.web.dev/
     看 LCP / CLS / INP（Core Web Vitals）
     目標：所有指標 Good

□ 6. 用「site:你的網域.com」搜尋
     看 Google 收錄了哪些頁
     第一週可能只有 1-2 頁，正常
```

---

## 7. Step 5：3-6 個月後的維護動作

**SEO 不是做一次了事，是持續性工作。**

### 每月做的事

```
1. 看 Search Console 的「成效」報告
   → 哪些關鍵字進來最多？
   → 哪些頁排名不錯但點擊率低？（改 title / description）

2. 看「索引狀態」
   → 有沒有頁被排除？為什麼？

3. 看「Core Web Vitals」
   → 有沒有頁變慢？
```

### 每季做的事

```
1. 競爭對手關鍵字研究
   → 用 Ahrefs / Semrush（或免費替代品 ubersuggest）
   → 看他們排前 10 的關鍵字
   → 找 gap：他們有寫但你沒寫的

2. 內容更新
   → 把流量最高的 3-5 篇文章做小升級
   → 加新數據、新案例、新內鏈
   → Google 會重新評估

3. 連結建立
   → 主動找媒體、部落客做曝光
   → 別買連結，會被罰
```

---

## 8. 大坑警示（新手常死在這）

### 坑 1：**等成果**心急

```
1 週：    Google 開始爬     ✓
2-4 週：  建立索引          ✓
3 個月：  進長尾關鍵字結果   ⚠️ 開始看到流量
6-12 個月：主關鍵字排名上來
1 年+：    穩定流量

新手最常見：做完 1 個月看不到流量就放棄
正確心態：SEO 是時間複利、半年起跳
```

### 坑 2：相信「SEO 黑魔法」

```
❌ 塞 30 個 keywords meta          Google 2009 已不看
❌ Title 塞滿關鍵字                會被當垃圾
❌ 白底白字塞關鍵字                 直接懲罰
❌ 買連結 / 連結農場                 罰到掉 100 頁後
❌ 抄別人的內容                     duplicate content 罰
```

### 坑 3：技術 SEO 只佔 30%

```
完整 SEO = 30% 技術 + 70% 內容

技術做完只是「把舞台搭好」。
真正讓你排名的是：
  ─ 寫得多動人的長文
  ─ 真實案例（不是 ChatGPT 生）
  ─ 有人會搜的關鍵字
  ─ 內容能解決真實問題
```

### 坑 4：過早優化 P2

```
還沒上線、沒內容 → P0 / P1 做完即可

千萬別：
  ❌ 還沒寫文章就先研究 LSI 關鍵字密度
  ❌ 沒有資料就先做 JSON-LD 動態化
  ❌ 沒有自然流量就買 SEO 工具

P0 做完上線、有真實流量後再做 P2 才划算
```

### 坑 5：忽略「人」 — 以為 SEO 是給機器看的

```
所有 SEO 工具的最終目的：
  搜尋引擎 → 把好內容推給人
  人 → 點進來
  人 → 停留 / 互動 / 轉換

光討好機器、忽略人 = Google 演算法越來越聰明、抓得到
```

---

## 9. 工具推薦清單

### 必備（免費）

| 工具 | 用途 | 連結 |
|---|---|---|
| **Google Search Console** | 監控排名、索引狀態 | search.google.com/search-console |
| **GA4** | 流量、行為分析 | analytics.google.com |
| **PageSpeed Insights** | Core Web Vitals 評分 | pagespeed.web.dev |
| **Rich Results Test** | JSON-LD 驗證 | search.google.com/test/rich-results |
| **Mobile-Friendly Test** | 手機友善度 | search.google.com/test/mobile-friendly |

### 進階（免費版夠用）

| 工具 | 用途 |
|---|---|
| **Ubersuggest** | 關鍵字研究 + 競爭對手分析 |
| **Screaming Frog**（免費 500 URL）| 全站爬一次找問題 |
| **AnswerThePublic** | 看大家搜什麼問題 |
| **Bing Webmaster** | 微軟搜尋引擎 |

### 付費（規模大才需要）

| 工具 | 月費 | 適合誰 |
|---|---|---|
| **Ahrefs** | $99+ | 內容行銷團隊 |
| **Semrush** | $129+ | SEO 專業 |
| **Surfer SEO** | $69+ | 寫文章前優化 |

---

## 10. TFA 案的具體進度（給後續參考）

| 階段 | 完成度 | 備註 |
|---|---|---|
| P0：robots / sitemap / favicon / title 修正 | ✅ 100% | commit 858d89b |
| P1：canonical / OG / Twitter | ✅ 100% | commit 858d89b |
| P1：noindex 給結帳 / 預覽 | ✅ 100% | 同上 |
| P2：JSON-LD 結構化資料 | ⏳ 待做 | 約 1-2 小時 |
| P2：圖片 alt 補完 | ⏳ 待做 | 約半天 |
| P2：h1 補關鍵字 | ⏳ 待做 | 約 1 小時 |
| P3：og:image 動態化 | 🔵 等後端 SSR | docs/10 提到 |
| P3：sitemap.xml 動態產 | 🔵 等後端 SSR | 同上 |

---

## 11. 給後續案子的 checklist（可印出貼牆上）

```
新案子上線前 SEO Checklist
──────────────────────────────────
HTML 階段：
□ <html lang="...">
□ <meta charset="UTF-8">
□ <meta viewport>
□ <title> 50-60 字
□ <meta description> 120-160 字
□ <link canonical>
□ <h1> 唯一一個
□ Open Graph 7 條
□ Twitter Card 4 條
□ <link rel="icon"> + manifest
□ <meta theme-color>

伺服器檔案：
□ robots.txt
□ sitemap.xml
□ favicon.ico / .svg
□ manifest.json

內容：
□ 圖片都有 alt
□ 內鏈錨文字帶關鍵字
□ noindex 給結帳 / 後台

JSON-LD：
□ Organization（首頁）
□ BreadcrumbList（每個非首頁）
□ Product（商品頁）
□ Article（文章頁）

上線 24 小時內：
□ Search Console 提交 sitemap
□ Bing Webmaster 提交 sitemap
□ GA4 裝好
□ PageSpeed Insights 跑一次
□ Rich Results Test 驗 JSON-LD
□ site: 搜尋確認收錄
```

---

## 一句話總結

> **SEO 是「翻譯活」，把人看的網站翻譯給機器，再讓機器把它推給對的人。**  
> 30% 技術 + 70% 內容 + 100% 耐心。  
> 做完 P0 / P1 後上線，剩下交給時間。
