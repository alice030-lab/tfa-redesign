/**
 * 長文入口（內容行銷 + SEO）
 * 承襲原檔「守護在地農業的使命——台南有機農友的一天」
 */

type Props = {
  title: string;
  lead: string;
  cover: string;
  tag: string;
  href: string;
  date: string;
  readingMins: number;
};

export function ArticleHero({ title, lead, cover, tag, href, date, readingMins }: Props) {
  return (
    <section className="bg-paper">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <a href={href} className="group grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden bg-paper-warm">
              <img
                src={cover}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
            <span className="absolute top-4 left-4 px-3 py-1 bg-paper text-xs font-latin tracking-[0.14em] text-vermillion border border-vermillion/40">
              {tag}
            </span>
          </div>

          <div>
            <p className="font-latin text-xs tracking-[0.24em] text-ink-light uppercase">
              Journal · 農友日誌
            </p>
            <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-ink leading-[1.25]">
              {title}
            </h2>
            <p className="mt-6 text-ink-mid leading-[1.9]">{lead}</p>

            <div className="mt-8 flex items-center gap-4 text-xs text-ink-light font-latin tracking-[0.12em]">
              <time>{date}</time>
              <span className="w-6 h-px bg-rule-dark" />
              <span>約 {readingMins} 分鐘</span>
            </div>

            <span className="mt-8 inline-block text-sm text-vermillion border-b border-vermillion/50 pb-1 group-hover:border-vermillion">
              讀這篇長文 →
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}
