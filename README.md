# 台灣鮮農改版 — 前端 Skeleton

本資料夾為「農民 IP 化」改版的前端元件骨架，基於 Laravel 12 + Inertia + React 19 + TypeScript + Tailwind CSS 4 設計。

## 目錄結構

```
resources/
├─ css/
│  └─ tokens.css                    ← 農民曆色彩計畫（Tailwind 4 @theme）
└─ js/
   ├─ types/farmer.ts               ← 農友型別（= 假資料 = 問卷題目）
   ├─ data/farmers.json             ← 4 真品牌 + 5 待上架 persona
   ├─ lib/cn.ts                     ← classnames util
   ├─ components/
   │  ├─ ui/                        ← 基礎件（農民曆風重繪）
   │  │  ├─ button.tsx              (solid / outline / ghost / cta)
   │  │  ├─ badge.tsx               (default / pine / vermillion / gold)
   │  │  ├─ card.tsx
   │  │  └─ separator.tsx           (line / stamp)
   │  ├─ blocks/farmer/             ← 農友頁專屬區塊
   │  │  ├─ FarmerHero.tsx
   │  │  ├─ FarmerStory.tsx         (右側 sticky 章節目錄)
   │  │  ├─ FarmerVideo.tsx         (0/1/N 支自適應)
   │  │  ├─ FarmerTimeline.tsx      (桌機水平 / 手機直式)
   │  │  ├─ FarmerGallery.tsx       (混合尺寸 grid + lightbox)
   │  │  ├─ FarmerMap.tsx           (OSM iframe + 無座標 fallback)
   │  │  ├─ FarmerProducts.tsx      (含手機 sticky CTA bar)
   │  │  ├─ FollowButton.tsx        (MVP: DB 存不發通知)
   │  │  └─ FarmerCard.tsx          (牆卡片 + ComingSoon 佔位)
   │  └─ blocks/home/
   │     └─ FarmerStorySection.tsx  (首頁人物輪播, 8s 自動切)
   └─ pages/
      ├─ farmer/[slug].tsx          ← /farmer/:slug  (乙：故事+商品同頁)
      └─ farmers.tsx                ← /farmers       (3x3 九宮格)
```

## 關鍵設計決策

| 主題 | 決定 |
|---|---|
| 改版定位 | 農民 IP 化（加工品職人路線） |
| 技術棧 | Laravel 12 + Inertia + React 19 + TS + Tailwind 4 |
| 多語系 | i18next（zh-TW 預設 / en 走 /en 路徑） |
| B2B | 獨立子站 b2b.tfa.com.tw（同一 Laravel 專案 domain routing） |
| 溯源 | 不做法規溯源，專做「故事溯源」 |
| 農友頁版型 | 乙方案：故事 + 商品同頁，scroll 下去即可購買 |
| 短影音 | 丙方案：videos[] 陣列，1 支 / N 支 UI 自適應 |
| 追蹤機制 | MVP：存 DB 但不發通知 |

## 4 位真實品牌 Persona

1. **阿甘｜波瑟沙植善農場**（台南）— 為弟弟的癌症種茶樹，MOA 有機
2. **黃建迪｜豐園羊牧場**（彰化田尾）— 科技人返鄉，380 頭努比亞山羊
3. **黃金木｜情人蜂蜜**（雲林土庫）— 追花 35 年，全台最大蜂蜜收購
4. **好呷覓｜東港社區合作社**（嘉義布袋）— 群像型，十年老菜脯湯包

+ 5 位「即將加入」佔位卡。

## 下一步建議

- [ ] Laravel 端：Controller + Route 綁 Inertia page（農友 CRUD + follow API）
- [ ] DB migration：`farmers`、`farmer_videos`、`farmer_timeline`、`farmer_product`（樞紐表）、`follows`
- [ ] i18n 文案抽離到 `locales/{zh-TW,en}/*.json`
- [ ] 農友攝影工作坊（專業肖像 × 4 位）
- [ ] 結構化問卷上線（給未來第 5+ 位農友填寫）
- [ ] 首頁其他區塊（Hero、節氣選品、SEO FAQ）
- [ ] B2B 子站獨立路由與價格邏輯
