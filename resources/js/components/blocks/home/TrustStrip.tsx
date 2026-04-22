/**
 * 認證 / 合作夥伴橫條 — 佔位文字章，未來換成 logo
 * 走朱紅 + 松綠兩色簡章風
 */
const ITEMS = [
  { key: "GMP", label: "國家食品 GMP 認證" },
  { key: "HACCP", label: "HACCP 食安驗證" },
  { key: "MOA", label: "MOA 有機驗證" },
  { key: "慈心", label: "慈心綠保標章" },
  { key: "TGAP", label: "TGAP 產銷履歷" },
  { key: "合作社聯合", label: "合作社聯合授權" },
];

export function TrustStrip() {
  return (
    <section className="bg-paper-warm border-y border-rule">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-10">
        <p className="text-center font-latin text-xs tracking-[0.28em] text-ink-light uppercase mb-6">
          Certifications · 安心與信任
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {ITEMS.map((i) => (
            <li key={i.key} className="flex items-center gap-3">
              <span className="flex items-center justify-center w-11 h-11 border border-pine/60 text-pine font-serif text-sm">
                {i.key.slice(0, 2)}
              </span>
              <span className="text-xs lg:text-sm text-ink-mid tracking-[0.08em]">
                {i.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
