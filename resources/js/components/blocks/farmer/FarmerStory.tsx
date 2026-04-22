import { Separator } from "@/components/ui/separator";
import type { Farmer } from "@/types/farmer";

type Props = { farmer: Pick<Farmer, "story"> };

/**
 * 長文故事
 * 桌機：主內容 + 右側 sticky 章節目錄
 * 手機：純單欄
 */
export function FarmerStory({ farmer }: Props) {
  const { intro, chapters } = farmer.story;

  return (
    <section className="bg-paper-warm">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[1fr_240px] gap-12 lg:gap-20">
          <article className="max-w-[720px] text-ink">
            {/* 導言 */}
            <p className="font-serif text-xl lg:text-2xl text-ink leading-[1.9] mb-12 first-letter:font-serif first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-vermillion">
              {intro}
            </p>

            <Separator variant="stamp" stampText="序" />

            {chapters.map((ch, i) => (
              <section id={`chapter-${i + 1}`} key={ch.title} className="mt-12">
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="font-latin text-3xl text-vermillion">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-serif text-2xl lg:text-3xl text-pine">{ch.title}</h2>
                </div>
                <p className="text-lg leading-[1.9] text-ink-mid whitespace-pre-line">
                  {ch.body}
                </p>
              </section>
            ))}
          </article>

          {/* 右側 sticky 章節目錄（桌機） */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-4 border-l border-rule-dark pl-5">
              <p className="font-latin text-xs text-ink-light tracking-[0.12em] uppercase">
                Chapters
              </p>
              {chapters.map((ch, i) => (
                <a
                  key={ch.title}
                  href={`#chapter-${i + 1}`}
                  className="block text-sm text-ink-mid hover:text-vermillion transition-colors"
                >
                  {String(i + 1).padStart(2, "0")} · {ch.title}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </section>
  );
}
