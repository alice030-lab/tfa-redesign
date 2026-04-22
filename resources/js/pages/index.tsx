import { Topbar } from "@/components/layout/Topbar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/blocks/home/Hero";
import { FarmerStorySection } from "@/components/blocks/home/FarmerStorySection";
import { SeasonalPicks } from "@/components/blocks/home/SeasonalPicks";
import { CategoryProducts } from "@/components/blocks/home/CategoryProducts";
import { ArticleHero } from "@/components/blocks/home/ArticleHero";
import { TrustStrip } from "@/components/blocks/home/TrustStrip";
import { B2BStrip } from "@/components/blocks/home/B2BStrip";
import type { Farmer } from "@/types/farmer";

type Props = {
  farmers: Farmer[];
  featured: Farmer;
  seasonal: React.ComponentProps<typeof SeasonalPicks>;
  categories: React.ComponentProps<typeof CategoryProducts>;
  article: React.ComponentProps<typeof ArticleHero>;
};

/**
 * 首頁（人物 IP 化版型）
 * 區塊順序：
 *   1. Topbar
 *   2. Navbar
 *   3. Hero         — 主文宣 × 本週主推農友
 *   4. FarmerStory  — 4 位農友輪播（改版主角）
 *   5. Seasonal     — 節氣 × 農友 × 商品
 *   6. Category     — 分類商品（次要導購）
 *   7. Article      — 長文入口（SEO / 內容）
 *   8. Trust        — 認證橫條
 *   9. B2B          — 企業採購子站入口
 *   10. Footer
 */
export default function HomePage({
  farmers,
  featured,
  seasonal,
  categories,
  article,
}: Props) {
  const publishedFarmers = farmers.filter((f) => f.status !== "coming_soon");

  return (
    <>
      <Topbar />
      <Navbar />

      <Hero
        feature={{
          slug: featured.slug,
          portrait: featured.portrait,
          nickname: featured.nickname,
          farm_name: featured.farm_name,
          region: featured.location.region,
          hero_quote: featured.hero_quote,
        }}
      />

      <FarmerStorySection farmers={publishedFarmers} />

      <SeasonalPicks {...seasonal} />

      <TrustStrip />

      <CategoryProducts {...categories} />

      <ArticleHero {...article} />

      <B2BStrip />

      <Footer />
    </>
  );
}
