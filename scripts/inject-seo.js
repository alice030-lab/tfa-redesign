/* inject-seo.js — One-shot 批次注入 SEO meta + favicon link 到全站 HTML
   ─────────────────────────────────────────────
   每頁注入：
     - <link rel="canonical">
     - Open Graph meta（og:type / title / description / image / url / site_name / locale）
     - Twitter Card meta
     - favicon / manifest 連結
     - theme-color
   注入位置：</head> 之前
   保護：偵測到已有 og: 就跳過（idempotent，可多次跑）
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = 'https://tfa.com.tw';
const OG_IMAGE = SITE + '/images/farmer-feature.jpg'; // 預設分享圖

// 各頁的 og:type 對應
const PAGE_TYPE = {
  'product-detail.html': 'product',
  'farmer-detail.html': 'profile',
  'story-homecoming.html': 'article',
  'story-2ndgen.html': 'article',
  'story-legacy.html': 'article',
  'story-mastery.html': 'article',
};

// 從 HTML 抽出 title 和 description
function extractMeta(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch  = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  return {
    title: titleMatch ? titleMatch[1].trim() : '台灣鮮農',
    desc:  descMatch  ? descMatch[1].trim()  : '台灣鮮農 · 200+ 認證農友、18 縣市產地直送。',
  };
}

function buildSeoBlock(file, meta) {
  const url = SITE + '/' + file;
  const ogType = PAGE_TYPE[file] || 'website';
  return `<!-- ═══ SEO meta（由 scripts/inject-seo.js 自動產出，可重跑覆蓋）═══ -->
<link rel="canonical" href="${url}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#c8402a">

<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:site_name" content="台灣鮮農 TFA">
<meta property="og:locale" content="zh_TW">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${meta.title}">
<meta name="twitter:description" content="${meta.desc}">
<meta name="twitter:image" content="${OG_IMAGE}">
<!-- ═══ /SEO meta ═══ -->
`;
}

// 處理一個檔案
function processFile(file) {
  const fp = path.join(ROOT, file);
  let html = fs.readFileSync(fp, 'utf8');

  // 移除舊的 SEO 區塊（如果之前跑過）
  html = html.replace(
    /<!-- ═══ SEO meta[\s\S]*?<!-- ═══ \/SEO meta ═══ -->\n?/,
    ''
  );

  // 也移除孤立的 canonical / og: / twitter: 標籤（避免重複）
  // 只清掉「整行只有一個這種標籤」的，保守一點
  html = html.replace(/^[ \t]*<link\s+rel="canonical"[^>]*>\s*\n/gm, '');
  html = html.replace(/^[ \t]*<meta\s+property="og:[^"]+"[^>]*>\s*\n/gm, '');
  html = html.replace(/^[ \t]*<meta\s+name="twitter:[^"]+"[^>]*>\s*\n/gm, '');
  html = html.replace(/^[ \t]*<link\s+rel="icon"[^>]*>\s*\n/gm, '');
  html = html.replace(/^[ \t]*<link\s+rel="manifest"[^>]*>\s*\n/gm, '');
  html = html.replace(/^[ \t]*<meta\s+name="theme-color"[^>]*>\s*\n/gm, '');

  const meta = extractMeta(html);
  const block = buildSeoBlock(file, meta);

  // 插在 </head> 之前
  if (!html.includes('</head>')) {
    console.log(`SKIP (no </head>): ${file}`);
    return;
  }
  html = html.replace('</head>', block + '</head>');
  fs.writeFileSync(fp, html);
  console.log(`✓ ${file}  (title: ${meta.title.slice(0, 40)}...)`);
}

// 主程式
const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let count = 0;
for (const f of files) {
  try {
    processFile(f);
    count++;
  } catch (e) {
    console.log(`ERROR ${f}: ${e.message}`);
  }
}
console.log(`\nProcessed ${count} files.`);
