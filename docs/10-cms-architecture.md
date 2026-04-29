# 10 · 後台內容管理架構建議

> **這份文件的目的：** 給後端同事一個明確的 CMS 架構選型 + 為什麼這樣選 + 怎麼開工。
> **前提：** 已經要用 Laravel 11 + MySQL，前端 16 種內容類型已盤點（見 §3）。
> **配套：** 03-data-models.md（schema）、09-templating-feasibility.md（哪些要 1:N 子表）。

---

## 1. 推薦架構：Laravel Filament v3

```
Laravel 11
├─ Filament v3                      ← 後台 admin panel（核心推薦）
├─ Spatie Laravel Media Library     ← 圖片上傳 + 多尺寸自動產
├─ TipTap PHP（Filament 內建）       ← 富文本編輯器（含自訂按鈕）
├─ Spatie Laravel Permission         ← 角色 / 權限（之後 farmer 自助會用）
└─ Sanctum                          ← 既有 / API token
```

**一句話總結：** 既有 Laravel 直接裝 Filament，半天有完整後台，編輯人員自助管理 16 種內容、零開發人員介入。

---

## 2. 為什麼是 Filament，不是別的

| 選項 | 評估 | 結論 |
|---|---|---|
| **Filament v3** ⭐ | Laravel 原生、PHP 生態、寫一個 Resource = 完整 CRUD | **推薦** |
| WordPress | 額外伺服器、PHP-FPM 衝突、API 繞一圈 | ❌ 浪費 |
| Strapi (Node.js) | 跟 PHP 棧不同、要另開 server | ❌ 異質 |
| Sanity / Contentful (SaaS) | 月費 $99+、資料在別家 | ❌ 貴 + 鎖供應商 |
| Directus | 連既有 DB、自動 admin、不錯但... | △ 比 Filament 弱在「自訂業務邏輯」 |
| 自刻 admin panel | 重新發明輪子、3 個月時間 | ❌ 不划算 |

**Filament 對 TFA 案子的關鍵優勢：**
1. ✅ 跟現有 Laravel 同進程，**沒有跨服務通訊**
2. ✅ 寫**一個 Resource 檔（80 行）**就有完整 CRUD UI
3. ✅ 富文本、媒體庫、拖曳排序、多語、權限**全內建**
4. ✅ TablePlus 看到的 DB schema = 後台看到的欄位（一比一）
5. ✅ 可以加自訂 PHP 業務邏輯（model events、policy）
6. ✅ 開源免費，自家伺服器跑

---

## 3. 實作分階段

### Phase 1（MVP，半天上線）

```bash
composer require filament/filament:"^3.2" -W
php artisan filament:install --panels
php artisan make:filament-user
```

→ http://tfa.com.tw/admin 立刻有後台殼

### Phase 2（核心 Resources，5-7 工作天）

每個 Resource 一個檔：

```
app/Filament/Resources/
├─ FarmerResource.php          ← 農友主資料
├─ ProductResource.php         ← 商品（最大張，含 manual_images / tagline）
├─ ArticleResource.php         ← 文章（4 種故事專題、Journal）
├─ SeasonResource.php          ← 24 節氣
├─ CategoryResource.php        ← 商品分類
├─ BrandResource.php           ← 品牌
├─ CouponResource.php          ← 折價券
├─ FarmerApplicationResource.php  ← 農友申請審核（contact / join）
├─ ContactMessageResource.php     ← 一般洽詢回覆
├─ OrderResource.php           ← 訂單管理
└─ UserResource.php            ← 會員 / 員工
```

### Phase 3（進階，未來）

```
─ Multi-tenant：farmer 角色看到自己的商品（policy 控制）
─ Approval workflow：草稿 → 待審 → 已發布
─ Activity Log（誰改了什麼）
─ 排程發布（節氣文未來日期）
```

---

## 4. 必裝套件清單（已經跟 Filament 整合好）

```bash
# 核心
composer require filament/filament:"^3.2"

# 媒體庫（圖片自動產多尺寸 + Cloudflare R2 整合）
composer require spatie/laravel-medialibrary
composer require filament/spatie-laravel-media-library-plugin:"^3.2"

# 角色 / 權限（farmer / admin / super_admin）
composer require spatie/laravel-permission
composer require bezhansalleh/filament-shield

# 富文本進階（TipTap，含自訂按鈕）
composer require awcodes/filament-tiptap-editor

# 拖曳排序（Q&A / gallery items / 等子表）
# Filament v3 內建 Reorder action

# Activity log（誰改過什麼）
composer require spatie/laravel-activitylog

# Sanctum（API token 給前端用，前端已預期）
# Laravel 11 預設帶
```

**全部開源免費。**

---

## 5. 架構整合圖

```
┌─────────────────────────────────────────────────────────┐
│  瀏覽器                                                    │
│  ┌──────────────────┐         ┌──────────────────────┐ │
│  │ TFA 前端站       │         │ Filament 後台         │ │
│  │ tfa.com.tw       │         │ tfa.com.tw/admin      │ │
│  │ (純 HTML / JS)   │         │ (Filament SPA)        │ │
│  └────────┬─────────┘         └──────────┬───────────┘ │
└───────────┼───────────────────────────────┼─────────────┘
            │ fetch /api/...                 │ /admin/...
            │                                │
            ▼                                ▼
┌─────────────────────────────────────────────────────────┐
│  Laravel 11（同一個 app）                                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │  routes/api.php          routes/web.php             ││
│  │  (前端用)                  (後台用，Filament 自動接)  ││
│  ├─────────────────────────────────────────────────────┤│
│  │  app/Http/Controllers/    app/Filament/Resources/   ││
│  │  (前端 API)                (後台 CRUD 自動產生)      ││
│  ├─────────────────────────────────────────────────────┤│
│  │  app/Models/                                        ││
│  │  (兩邊共用 Eloquent models)                          ││
│  ├─────────────────────────────────────────────────────┤│
│  │  config/filesystems.php → R2 disk                    ││
│  └────────────────────┬────────────────────────────────┘│
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
                ┌───────────────┐  ┌──────────────────┐
                │  MySQL 8      │  │ Cloudflare R2    │
                │  (既有 DB)    │  │ (圖片 / 影片縮圖)│
                └───────────────┘  └──────────────────┘
```

**重點：前端 + 後台共用同一個 Laravel app + 同一個 DB**。沒有跨服務、沒有同步問題、沒有額外伺服器費用。

---

## 6. 一個 Resource 真的長這樣

範例 — 農友後台（給後端參考難度）：

```php
<?php
namespace App\Filament\Resources;

use App\Models\Farmer;
use Filament\Resources\Resource;
use Filament\Forms\Components\{TextInput, Textarea, Select, Repeater, Section};
use Awcodes\FilamentTiptapEditor\TiptapEditor;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Tables\Columns\{TextColumn, ImageColumn, BadgeColumn};

class FarmerResource extends Resource {
  protected static ?string $model = Farmer::class;
  protected static ?string $navigationIcon = 'heroicon-o-user-group';
  protected static ?string $navigationLabel = '農友';

  public static function form(Form $form): Form {
    return $form->schema([
      Section::make('基本資料')->columns(2)->schema([
        TextInput::make('name')->label('農友名稱')->required(),
        TextInput::make('slug')->label('網址 slug')->required()->unique(ignoreRecord: true),
        TextInput::make('farm_name')->label('農場名'),
        Select::make('region')->label('縣市')->options([
          '台北'=>'台北', '雲林'=>'雲林', /* 22 個 */
        ])->required(),
        TextInput::make('seal_text')->label('印章直書（用 | 標斷行）')
          ->helperText('例：波|瑟沙　會顯示成兩行直書'),
      ]),

      Section::make('故事 · 富文本')->schema([
        TiptapEditor::make('story')
          ->profile('default')
          ->extraInputAttributes(['style' => 'min-height: 320px'])
          ->profile('default')                    // 包含粗體 / 引言 / 標題等
          ->disk('r2'),                           // 圖片直接傳 R2
      ]),

      Section::make('訪談 Q&A')->schema([
        Repeater::make('qas')                     // 拖曳排序
          ->relationship()
          ->schema([
            TextInput::make('question')->required(),
            TiptapEditor::make('answer_html')->required(),
          ])
          ->reorderableWithButtons()
          ->collapsible()
          ->itemLabel(fn(array $state): ?string => $state['question'] ?? '新題目'),
      ]),

      Section::make('策展數字條（5 格）')->schema([
        Repeater::make('glances')
          ->relationship()
          ->schema([
            TextInput::make('value')->placeholder('12'),
            TextInput::make('unit')->placeholder('年（可空）'),
            TextInput::make('label')->placeholder('樹齡茶樹'),
          ])
          ->columns(3)
          ->reorderableWithButtons()
          ->maxItems(5),
      ]),

      Section::make('媒體')->schema([
        SpatieMediaLibraryFileUpload::make('portrait')
          ->collection('portrait')->image()->required(),
        SpatieMediaLibraryFileUpload::make('gallery')
          ->collection('gallery')->image()->multiple()->reorderable(),
      ]),
    ]);
  }

  public static function table(Table $table): Table {
    return $table
      ->columns([
        ImageColumn::make('portrait_url')->circular(),
        TextColumn::make('name')->searchable()->sortable(),
        TextColumn::make('region')->badge(),
        TextColumn::make('products_count')->counts('products')->label('商品數'),
        TextColumn::make('updated_at')->dateTime()->sortable(),
      ])
      ->filters([
        SelectFilter::make('region')->options([/* ... */]),
      ]);
  }
}
```

**這就是一個完整功能的後台頁面：列表 + 搜尋 + 篩選 + 新增 + 編輯 + 刪除 + 富文本 + 拖曳子表 + 圖片上傳。**

---

## 7. 工時估計（後端視角）

| 項目 | 工時 |
|---|---|
| Filament 安裝 + 第一次設定 | 0.5d |
| FarmerResource（最複雜，含 4 個 1:N 子表） | 1.5d |
| ProductResource（含 manual_images） | 1d |
| ArticleResource | 0.5d |
| SeasonResource + 24 節氣 seed | 0.5d |
| CategoryResource / BrandResource | 0.5d |
| CouponResource | 0.5d |
| FarmerApplicationResource + ContactMessageResource | 0.5d |
| OrderResource（含狀態流轉）| 1d |
| 角色 / 權限初版（admin only） | 0.5d |
| R2 disk 設定 + 媒體庫整合 | 0.5d |
| TipTap 自訂按鈕（pull quote / dropcap） | 0.5d |
| 中文化（filament-translations）| 0.3d |
| **小計** | **約 8 工作天** |

之後 farmer 自助 marketplace 模式（見 docs/07）約再加 5-7 天。

---

## 8. 部署 / 維運

```
domain:                 admin.tfa.com.tw  或  tfa.com.tw/admin（任一）
SSL:                    Let's Encrypt（同主站）
資料庫:                 共用 tfa 主 DB
備份:                   每天 mysqldump → R2
快取:                   Redis（Filament 預設用 file，可換 Redis）
監控:                   Laravel Telescope（只在 staging）
                        Sentry（正式環境）
```

不需要額外伺服器。Filament 跑在同一個 PHP-FPM 進程裡。

---

## 9. 參考資源（給後端同事自學）

- 官方文件：https://filamentphp.com/docs/3.x
- 中文教學：https://laravel-news.com/filament-v3
- 範例 repo：https://github.com/filamentphp/demo
- TipTap profile 配置：https://github.com/awcodes/filament-tiptap-editor

---

## 10. TL;DR

```
建議裝：Laravel Filament v3 + 4 個 Spatie 套件
為什麼：原生 Laravel、零跨服務、開源免費、編輯體驗一流
怎麼開工：composer require + 半天裝完 + 一週寫完所有 Resource
工時：約 8 工作天（不含 marketplace 階段）
月費：NT$ 0（自架伺服器既有）
```
