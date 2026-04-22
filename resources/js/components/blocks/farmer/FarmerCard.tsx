import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { Farmer } from "@/types/farmer";

type Props = { farmer: Farmer; href?: string };

/**
 * 農友卡（用在農友牆、首頁輪播、交叉推薦）
 * 兩個狀態：published / coming_soon
 */
export function FarmerCard({ farmer, href }: Props) {
  if (farmer.status === "coming_soon") {
    return <ComingSoonCard />;
  }
  return (
    <a
      href={href ?? `/farmer/${farmer.slug}`}
      className="group block relative bg-paper-card border border-rule overflow-hidden hover:border-pine transition-colors"
    >
      <div className="aspect-[4/5] overflow-hidden bg-paper-warm">
        <img
          src={farmer.portrait}
          alt={farmer.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
        />
      </div>

      {/* 朱紅印章：暱稱 */}
      <div className="absolute top-4 left-4 stamp-seal">
        {farmer.nickname.slice(0, 2) || "農"}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-ink-light font-latin mb-2">
          <span>{farmer.location.region}</span>
          <span className="w-4 h-px bg-rule-dark" />
          <span>{farmer.years} 年</span>
        </div>
        <h3 className="font-serif text-xl text-ink mb-1">{farmer.nickname}</h3>
        <p className="text-sm text-ink-mid mb-3 truncate">{farmer.farm_name}</p>
        <p className="text-sm text-pine leading-[1.7] line-clamp-2 min-h-[2.8em] font-serif">
          「{farmer.hero_quote}」
        </p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {farmer.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="default">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </a>
  );
}

function ComingSoonCard() {
  return (
    <div
      className={cn(
        "relative bg-paper-warm border border-dashed border-rule-dark",
        "aspect-[4/5] lg:aspect-auto lg:min-h-full",
        "flex flex-col items-center justify-center p-6 text-center"
      )}
    >
      <div className="stamp-seal mb-5 opacity-70">即</div>
      <p className="font-serif text-2xl text-ink-light mb-1">即將加入</p>
      <p className="text-xs text-ink-light font-latin tracking-[0.14em]">
        NEW FARMER · COMING SOON
      </p>
      <a
        href="/join"
        className="mt-6 text-xs text-vermillion border-b border-vermillion/40 pb-0.5 hover:border-vermillion transition-colors"
      >
        你也是農友？加入我們
      </a>
    </div>
  );
}
