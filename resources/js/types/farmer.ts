/**
 * 農友資料型別
 * 這份 type 同時是：
 *   (1) 假資料格式
 *   (2) 未來農友問卷題目結構
 *   (3) DB schema 雛型
 */

export type Image = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type Video = {
  src: string;          // mp4 / hls / youtube embed
  poster?: string;
  duration?: number;    // 秒
  caption?: string;
  ratio?: "9:16" | "16:9" | "1:1";  // 預設 9:16
};

export type TimelineItem = {
  date: string;         // YYYY-MM
  label: string;        // ≤ 8 字
  note?: string;        // ≤ 50 字
};

export type StoryChapter = {
  title: string;        // ≤ 15 字
  body: string;         // markdown，300–500 字
};

export type Farmer = {
  slug: string;
  name: string;
  nickname: string;
  farm_name: string;
  location: {
    region: string;
    coords?: [number, number];
  };
  years: number;
  tags: string[];            // max 4

  // 敘事
  hero_quote: string;        // ≤ 28 字
  story: {
    intro: string;           // ≤ 200 字
    chapters: StoryChapter[];
  };

  // 視覺
  portrait: string;          // 正臉肖像，直式裁切
  photos: string[];          // 4–8 張
  videos: Video[];           // 0 / 1 / N 自適應

  // 時間軸
  timeline: TimelineItem[];  // 5–8 筆

  // 導購關聯（不重存商品資料）
  product_ids: string[];

  // IP 化
  follower_count?: number;
  social?: {
    fb?: string;
    ig?: string;
    line?: string;
  };

  // 狀態
  status?: "published" | "coming_soon";
};
