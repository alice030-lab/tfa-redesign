import { FarmerHero } from "@/components/blocks/farmer/FarmerHero";
import { FarmerStory } from "@/components/blocks/farmer/FarmerStory";
import { FarmerVideo } from "@/components/blocks/farmer/FarmerVideo";
import { FarmerTimeline } from "@/components/blocks/farmer/FarmerTimeline";
import { FarmerGallery } from "@/components/blocks/farmer/FarmerGallery";
import { FarmerMap } from "@/components/blocks/farmer/FarmerMap";
import { FarmerProducts } from "@/components/blocks/farmer/FarmerProducts";
import type { Farmer } from "@/types/farmer";

type ProductLite = {
  id: string;
  name: string;
  image: string;
  price: number;
  original_price?: number;
  spec?: string;
};

type Props = {
  farmer: Farmer;
  products: ProductLite[];
};

/**
 * /farmer/[slug]
 * 版型依你選定的（乙）：故事 + 商品同頁，scroll 下去即可購買
 */
export default function FarmerProfile({ farmer, products }: Props) {
  return (
    <main className="bg-paper pb-24 lg:pb-0">
      <FarmerHero farmer={farmer} />
      <FarmerStory farmer={farmer} />
      <FarmerVideo videos={farmer.videos} />
      <FarmerTimeline items={farmer.timeline} />

      {/* 地圖 + 相簿 */}
      <section className="bg-paper">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-2xl text-ink mb-4">產地</h3>
              <FarmerMap region={farmer.location.region} coords={farmer.location.coords} />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-ink mb-4">關於這塊田</h3>
              <p className="text-ink-mid leading-[1.9]">
                {farmer.farm_name}位於{farmer.location.region}，經營 {farmer.years} 年。
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {farmer.tags.map((t) => (
                  <span key={t} className="text-sm text-pine">
                    # {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FarmerGallery photos={farmer.photos} alt={farmer.name} />
      <FarmerProducts products={products} />
    </main>
  );
}
