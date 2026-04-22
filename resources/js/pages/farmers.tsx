import { FarmerCard } from "@/components/blocks/farmer/FarmerCard";
import type { Farmer } from "@/types/farmer";

type Props = { farmers: Farmer[] };

/**
 * /farmers — 農友牆
 * 視覺目標：像 Netflix 的人物選角頁，以「人」為 IP 單位
 * 佈局：3x3 九宮格（桌機），4 真 + 5 待上架
 */
export default function FarmersPage({ farmers }: Props) {
  const published = farmers.filter((f) => f.status !== "coming_soon").length;
  const total = farmers.length;

  return (
    <main className="bg-paper">
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16 lg:py-24 text-center">
          <p className="font-latin text-xs text-ink-light tracking-[0.24em] uppercase">
            Farmers
          </p>
          <h1 className="font-serif text-4xl lg:text-6xl text-ink mt-3 leading-tight">
            每一份商品背後，<br className="lg:hidden" />
            都是一個人。
          </h1>
          <p className="mt-5 text-ink-mid max-w-[560px] mx-auto">
            台灣鮮農不賣匿名的貨。我們認識每一位農友、走過他的田、聽過他的故事——
            然後，才把那份味道交給你。
          </p>

          <div className="mt-8 inline-flex items-center gap-4 px-5 py-2 border border-rule">
            <span className="font-latin text-sm text-ink-mid">
              {published} <span className="text-ink-light">/ {total}</span>
            </span>
            <span className="w-px h-4 bg-rule-dark" />
            <span className="text-xs text-ink-light tracking-[0.14em]">位農友已上架</span>
          </div>
        </div>
      </section>

      {/* 3x3 九宮格 */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7">
            {farmers.map((farmer) => (
              <FarmerCard key={farmer.slug} farmer={farmer} />
            ))}
          </div>
        </div>
      </section>

      {/* 底部呼籲 */}
      <section className="bg-pine text-paper py-20">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <p className="font-latin text-xs tracking-[0.24em] text-paper-warm/80">
            Join Us
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl mt-3">你的田，也想被看見嗎？</h2>
          <p className="mt-4 text-paper-warm/90">
            我們正在尋找第五位、第六位、第七位農友。
            不用你會寫故事，我們會去你的田，把故事帶回來。
          </p>
          <a
            href="/join"
            className="inline-block mt-8 px-8 h-14 leading-[56px] bg-vermillion text-paper tracking-[0.14em] hover:bg-vermillion-mid transition-colors"
          >
            加入農友招募
          </a>
        </div>
      </section>
    </main>
  );
}
