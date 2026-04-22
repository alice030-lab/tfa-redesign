import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  original_price?: number;
  spec?: string;
  farmer_nickname: string;
  farmer_slug: string;
};

type Category = { key: string; label: string; en: string };

type Props = {
  categories: Category[];
  products: Record<string, Product[]>;  // key -> products[]
};

/**
 * 分類商品速覽（次要導購區）
 * 原檔有 cat-tab 樣式，沿用
 */
export function CategoryProducts({ categories, products }: Props) {
  const [active, setActive] = useState(categories[0]?.key ?? "");
  const list = products[active] ?? [];

  return (
    <section className="bg-paper">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <header className="text-center mb-10">
          <p className="font-latin text-xs tracking-[0.24em] text-ink-light uppercase">
            Categories · 台灣土地的滋味
          </p>
          <h2 className="mt-3 font-serif text-4xl lg:text-5xl text-ink">
            從田裡到餐桌
          </h2>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 border-b border-rule">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={cn(
                "px-5 py-3 text-sm tracking-[0.12em] border-b-2 -mb-px transition-colors",
                active === c.key
                  ? "border-vermillion text-vermillion"
                  : "border-transparent text-ink-mid hover:text-ink"
              )}
            >
              <span className="font-serif">{c.label}</span>
              <span className="ml-2 font-latin text-xs text-ink-light">{c.en}</span>
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {list.map((p) => (
            <Card key={p.id} className="group overflow-hidden hover:border-pine transition-colors">
              <a href={`/product/${p.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-paper-warm">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  />
                </div>
                <div className="p-4">
                  <a
                    href={`/farmer/${p.farmer_slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-vermillion hover:underline font-latin"
                  >
                    {p.farmer_nickname}
                  </a>
                  <h3 className="mt-1 font-serif text-base text-ink line-clamp-2 min-h-[3em]">
                    {p.name}
                  </h3>
                  {p.spec && <p className="text-xs text-ink-light mt-1">{p.spec}</p>}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-latin text-lg text-vermillion">
                      NT$ {p.price.toLocaleString()}
                    </span>
                    {p.original_price && (
                      <span className="font-latin text-xs text-ink-light line-through">
                        {p.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/products"
            className="inline-block px-8 h-12 leading-[48px] border border-pine text-pine text-sm tracking-[0.14em] hover:bg-pine hover:text-paper transition-colors"
          >
            看全部商品
          </a>
        </div>
      </div>
    </section>
  );
}
