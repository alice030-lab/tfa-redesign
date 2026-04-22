import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type SeasonalProduct = {
  id: string;
  name: string;
  farmer_nickname: string;
  farmer_slug: string;
  image: string;
  price: number;
  tag?: string; // e.g. "本週新到"
};

type Props = {
  solarTerm: string;   // 節氣名，如「穀雨」
  solarEn: string;     // "Grain Rain"
  lead: string;        // 簡介
  items: SeasonalProduct[];
};

/**
 * 節氣選品 — 節氣 × 農友 × 商品三線交叉
 * 承襲原檔「驚蟄・春耕食材」但換成更明確的敘事：這個節氣，這些人在做這些事
 */
export function SeasonalPicks({ solarTerm, solarEn, lead, items }: Props) {
  return (
    <section className="bg-paper-warm">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <p className="font-latin text-xs tracking-[0.24em] text-ink-light uppercase">
              {solarEn} · 節氣選品
            </p>
            <h2 className="mt-3 font-serif text-4xl lg:text-5xl text-ink flex items-baseline gap-4">
              <span className="text-vermillion">{solarTerm}</span>
              <span className="font-latin text-base text-ink-light tracking-[0.14em]">
                seasonal picks
              </span>
            </h2>
            <p className="mt-4 text-ink-mid max-w-[620px] leading-[1.9]">{lead}</p>
          </div>
          <a
            href="/seasonal"
            className="text-sm text-ink-mid hover:text-vermillion border-b border-rule-dark pb-1 self-start lg:self-end"
          >
            看所有節氣 →
          </a>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {items.map((p) => (
            <Card key={p.id} className="group overflow-hidden hover:border-pine transition-colors">
              <a href={`/product/${p.id}`} className="block">
                <div className="aspect-[4/5] overflow-hidden bg-paper-warm relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  />
                  {p.tag && (
                    <span className="absolute top-3 left-3">
                      <Badge variant="vermillion">{p.tag}</Badge>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <a
                    href={`/farmer/${p.farmer_slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-vermillion hover:underline font-latin tracking-[0.08em]"
                  >
                    {p.farmer_nickname}
                  </a>
                  <h3 className="mt-1.5 font-serif text-base text-ink line-clamp-2 min-h-[3em]">
                    {p.name}
                  </h3>
                  <p className="mt-3 font-latin text-lg text-ink">
                    NT$ {p.price.toLocaleString()}
                  </p>
                </div>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
