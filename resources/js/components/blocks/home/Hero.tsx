import { Button } from "@/components/ui/button";

type Props = {
  feature: {
    slug: string;
    portrait_cutout: string;   // ← 去背 PNG
    nickname: string;
    farm_name: string;
    region: string;
  };
};

/**
 * Hero — 農友故事型（文青舒適 × 不失活潑）
 * 參考 ACO 農民曆 × 用戶提供的排版範例：
 *   左側：細線 FARMER·STORY → 大標（含朱紅單字強調）→ 敘事 → 數字 → Outline CTA
 *   右側：去背農夫 overlay 在米紙底上，不框盒子
 *   頂部：右上掛「農場名」tag，呼應木刻印感
 *   底部：淡金麥穗漸層，增加 warmth
 *
 * 配色策略：
 *   - 底 paper，文字 pine + vermillion 單字強調
 *   - 數字用 pine 粗體 + gold 上標/下畫
 *   - 朱紅只出現在 2 處（單字 + 章）
 */
export function Hero({ feature }: Props) {
  return (
    <section className="relative bg-paper overflow-hidden">
      {/* 底部淡金麥穗漸層，呼應去背圖下方的麥田 */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[30%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(196,148,40,0.15) 0%, rgba(196,148,40,0.06) 50%, transparent 100%)",
        }}
      />

      <div className="relative max-w-[1360px] mx-auto px-6 lg:px-12 pt-8 lg:pt-12 pb-0">
        {/* 頂部裝飾列 */}
        <div className="flex items-center justify-between mb-12 lg:mb-16">
          <div className="flex items-center gap-4">
            <span className="w-10 lg:w-16 h-px bg-ink/40" />
            <span className="font-latin text-xs tracking-[0.32em] text-vermillion uppercase">
              Farmer · Story
            </span>
          </div>
          {/* 右上：農場名 tag（木刻章感） */}
          <div className="px-4 lg:px-5 py-2 bg-earth-pale border border-earth/20 rounded-sm">
            <p className="font-serif text-sm lg:text-base text-earth tracking-[0.1em]">
              {feature.farm_name}
            </p>
          </div>
        </div>

        {/* 主內容：左文右圖 */}
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-10 items-end min-h-[560px] lg:min-h-[640px]">
          {/* 左：敘事 */}
          <div className="pb-12 lg:pb-16">
            <h1 className="font-serif text-[44px] lg:text-[84px] leading-[1.15] text-pine font-normal">
              每一份食材<br />
              背後都有一個
              <span className="relative text-vermillion">
                名字
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gold/70"
                />
              </span>
            </h1>

            <p className="mt-8 lg:mt-10 text-ink-mid leading-[2] max-w-[440px]">
              我們的農友不只是供應商，<br />
              是擁有名字、土地、故事的人。<br />
              台灣鮮農讓你認識每一位種下食物的手。
            </p>

            {/* 數字：稻金 + 松綠 */}
            <dl className="mt-10 lg:mt-14 flex gap-10 lg:gap-14">
              {[
                { k: "200", sup: "+", v: "認證農友" },
                { k: "18", sup: "", v: "縣市產地" },
                { k: "7", sup: "yr", v: "深耕年資" },
              ].map((d) => (
                <div key={d.v}>
                  <dt className="flex items-baseline gap-0.5">
                    <span className="font-serif text-[44px] lg:text-[56px] leading-none text-pine">
                      {d.k}
                    </span>
                    <span className="font-latin text-lg text-gold">{d.sup}</span>
                  </dt>
                  <dd className="mt-2 text-xs text-ink-light tracking-[0.18em] font-latin">
                    {d.v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 lg:mt-14">
              <a
                href="/farmers"
                className="group inline-flex items-center justify-between gap-6 w-full sm:w-[320px] h-14 px-6 border border-pine text-pine hover:bg-pine hover:text-paper transition-colors"
              >
                <span className="tracking-[0.2em] text-sm">認識所有農友</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          {/* 右：農夫去背圖（浮於紙上） */}
          <div className="relative self-end">
            {/* 朱紅章：暱稱，浮在圖片左上 */}
            <span
              aria-hidden
              className="absolute top-4 left-0 stamp-seal !w-14 !h-14 !text-sm z-10"
            >
              {feature.nickname.slice(0, 2) || "農"}
            </span>

            {/* 稻金點綴小裝飾：右上角小圓點 + 細字 */}
            <div className="absolute top-4 right-0 z-10 text-right">
              <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] text-gold font-latin uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                This Week
              </span>
            </div>

            <img
              src={feature.portrait_cutout}
              alt={feature.nickname}
              className="w-full h-auto max-h-[720px] object-contain object-bottom relative"
            />

            {/* 底部暱稱 + 產地（疊在麥田金漸層上） */}
            <div className="absolute bottom-6 lg:bottom-10 left-0 right-0 flex items-end justify-between gap-4 px-2">
              <div>
                <p className="font-latin text-[10px] tracking-[0.28em] text-ink-light uppercase">
                  {feature.region}
                </p>
                <p className="font-serif text-2xl lg:text-3xl text-pine mt-1">
                  {feature.nickname}
                </p>
              </div>
              <a
                href={`/farmer/${feature.slug}`}
                className="text-xs text-vermillion border-b border-vermillion/50 pb-0.5 hover:border-vermillion transition-colors"
              >
                看他的故事 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
