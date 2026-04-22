import type { TimelineItem } from "@/types/farmer";

type Props = { items: TimelineItem[] };

/**
 * 今年的農事時間軸
 * 桌機：水平，節點+線條
 * 手機：直式堆疊
 */
export function FarmerTimeline({ items }: Props) {
  if (!items.length) return null;

  return (
    <section className="bg-paper-warm border-y border-rule">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-14">
        <header className="mb-10">
          <p className="font-latin text-xs text-ink-light tracking-[0.2em] uppercase">
            This Year
          </p>
          <h2 className="font-serif text-3xl text-ink mt-1">今年，他在做什麼</h2>
        </header>

        {/* 桌機：水平 */}
        <ol className="hidden lg:flex items-start justify-between relative">
          <span className="absolute top-3 left-0 right-0 h-px bg-rule-dark" />
          {items.map((it) => (
            <li key={it.date} className="relative flex flex-col items-center text-center w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-vermillion border-2 border-paper-warm relative z-10" />
              <p className="mt-4 font-latin text-xs text-ink-light">{it.date}</p>
              <p className="mt-1 font-serif text-lg text-pine">{it.label}</p>
              {it.note && <p className="mt-1 text-xs text-ink-mid max-w-[160px]">{it.note}</p>}
            </li>
          ))}
        </ol>

        {/* 手機：直式 */}
        <ol className="lg:hidden space-y-5 border-l-2 border-rule-dark pl-5">
          {items.map((it) => (
            <li key={it.date} className="relative">
              <span className="absolute -left-[26px] top-2 w-2.5 h-2.5 rounded-full bg-vermillion" />
              <p className="font-latin text-xs text-ink-light">{it.date}</p>
              <p className="font-serif text-lg text-pine">{it.label}</p>
              {it.note && <p className="text-sm text-ink-mid">{it.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
