import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowButton } from "./FollowButton";
import type { Farmer } from "@/types/farmer";

type Props = { farmer: Farmer };

/**
 * 農友頁 Hero
 * 桌機：左肖像（直式 560x720）右敘事；手機：肖像滿版 + 下方敘事
 */
export function FarmerHero({ farmer }: Props) {
  return (
    <section className="bg-paper border-b border-rule">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-10 lg:py-20">
        <div className="grid lg:grid-cols-[560px_1fr] gap-10 lg:gap-16 items-center">
          {/* 肖像 */}
          <div className="relative">
            <div className="aspect-[7/9] overflow-hidden bg-paper-warm">
              <img
                src={farmer.portrait}
                alt={farmer.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            {/* 朱紅印章：農友暱稱 */}
            <div className="absolute -bottom-4 -right-4 stamp-seal !w-16 !h-16 !text-base">
              {farmer.nickname.slice(0, 2) || "農"}
            </div>
          </div>

          {/* 敘事 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-sm text-ink-mid font-latin">
              <span>{farmer.location.region}</span>
              <span className="w-8 h-px bg-rule-dark" />
              <span>{farmer.years} 年</span>
            </div>

            <h1 className="font-serif text-4xl lg:text-6xl leading-[1.25] text-ink">
              {farmer.nickname}
              <span className="block text-xl lg:text-2xl text-ink-mid mt-2 font-sans">
                {farmer.farm_name}
              </span>
            </h1>

            <blockquote className="border-l-2 border-vermillion pl-5 py-2">
              <p className="font-serif text-2xl lg:text-3xl text-pine leading-[1.6]">
                「{farmer.hero_quote}」
              </p>
              <cite className="block mt-3 not-italic text-sm text-ink-light font-latin">
                ── {farmer.name} · {farmer.farm_name}
              </cite>
            </blockquote>

            <div className="flex flex-wrap gap-2">
              {farmer.tags.map((t) => (
                <Badge key={t} variant="pine">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <FollowButton slug={farmer.slug} initialCount={farmer.follower_count ?? 0} />
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById("farmer-products")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                看商品 ↓
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
