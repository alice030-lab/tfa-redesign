import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { Farmer } from "@/types/farmer";

type Props = {
  farmers: Farmer[];          // 只傳 published，上限建議 4–6 位
  autoPlay?: boolean;         // 預設開，8 秒切換
  intervalMs?: number;
};

/**
 * 首頁 FarmerStory 改版區 —— 人物輪播
 *
 * 視覺概念：左半張大臉肖像、右半故事金句，切換時像翻農民曆的一頁
 * 每張輪播一位農友，停留 8 秒自動切換，hover / touch 時暫停
 * 底部有農友列（小肖像＋暱稱）可手動切換
 */
export function FarmerStorySection({
  farmers,
  autoPlay = true,
  intervalMs = 8000,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => {
      setIndex(((next % farmers.length) + farmers.length) % farmers.length);
    },
    [farmers.length]
  );

  useEffect(() => {
    if (!autoPlay || paused || farmers.length <= 1) return;
    timer.current = window.setTimeout(() => go(index + 1), intervalMs);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [autoPlay, paused, index, intervalMs, farmers.length, go]);

  if (!farmers.length) return null;
  const f = farmers[index];

  return (
    <section
      className="relative bg-paper-warm overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* 標題列 */}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-8 flex items-end justify-between">
        <div>
          <p className="font-latin text-xs text-ink-light tracking-[0.24em] uppercase">
            Farmers · 農友誌
          </p>
          <h2 className="font-serif text-3xl lg:text-5xl text-ink mt-2">
            每一份商品，都是一個人的故事
          </h2>
        </div>
        <a
          href="/farmers"
          className="hidden lg:inline-block text-sm text-ink-mid hover:text-vermillion tracking-[0.12em] border-b border-rule-dark pb-1 transition-colors"
        >
          看全部農友 →
        </a>
      </div>

      {/* 主舞台 */}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 pb-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center min-h-[560px]">
          {/* 肖像（含翻頁動效） */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-ink">
              {farmers.map((x, i) => (
                <img
                  key={x.slug}
                  src={x.portrait}
                  alt={x.name}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                    i === index ? "opacity-100" : "opacity-0"
                  )}
                />
              ))}
            </div>
            {/* 朱紅印章 */}
            <div className="absolute -top-4 -left-4 stamp-seal !w-14 !h-14 !text-sm">
              {f.nickname.slice(0, 2) || "農"}
            </div>
            {/* 進度條 */}
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-paper-warm/50">
              <div
                className={cn(
                  "h-full bg-vermillion transition-all ease-linear",
                  paused ? "" : ""
                )}
                style={{
                  width: paused ? "100%" : "100%",
                  transitionDuration: paused ? "0ms" : `${intervalMs}ms`,
                  transform: `scaleX(${paused ? 0 : 1})`,
                  transformOrigin: "left",
                }}
                key={`${index}-${paused}`}
              />
            </div>
          </div>

          {/* 敘事 */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-sm text-ink-mid font-latin">
              <span>{f.location.region}</span>
              <span className="w-8 h-px bg-rule-dark" />
              <span>{f.farm_name}</span>
            </div>

            <h3 className="font-serif text-5xl lg:text-6xl text-ink leading-[1.2]">
              {f.nickname}
            </h3>

            <blockquote className="border-l-2 border-vermillion pl-5 py-1">
              <p className="font-serif text-2xl lg:text-3xl text-pine leading-[1.65]">
                「{f.hero_quote}」
              </p>
            </blockquote>

            <p className="text-ink-mid leading-[1.9] line-clamp-4">{f.story.intro}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {f.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="pine">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button variant="solid" onClick={() => (window.location.href = `/farmer/${f.slug}`)}>
                看他的故事
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = `/farmer/${f.slug}#farmer-products`)}
              >
                買他種的
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部農友列（小肖像切換） */}
      <nav className="border-t border-rule-dark bg-paper">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
          <ul className="flex overflow-x-auto">
            {farmers.map((x, i) => (
              <li key={x.slug} className="flex-1 min-w-[180px]">
                <button
                  onClick={() => go(i)}
                  className={cn(
                    "w-full flex items-center gap-3 py-4 px-2 text-left border-r border-rule last:border-r-0 transition-colors",
                    i === index
                      ? "bg-paper-warm"
                      : "hover:bg-paper-warm/50"
                  )}
                >
                  <span
                    className={cn(
                      "w-10 h-10 rounded-full overflow-hidden bg-paper-warm shrink-0 border-2",
                      i === index ? "border-vermillion" : "border-transparent"
                    )}
                  >
                    <img src={x.portrait} alt="" className="w-full h-full object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-sm text-ink truncate">
                      {x.nickname}
                    </span>
                    <span className="block font-latin text-xs text-ink-light truncate">
                      {x.location.region}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 手機看全部 */}
      <div className="lg:hidden text-center py-6">
        <a
          href="/farmers"
          className="text-sm text-ink-mid border-b border-rule-dark pb-1"
        >
          看全部農友 →
        </a>
      </div>
    </section>
  );
}
