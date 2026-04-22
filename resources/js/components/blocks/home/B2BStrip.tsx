/**
 * B2B 獨立子站入口
 */
export function B2BStrip() {
  return (
    <section className="bg-pine text-paper relative overflow-hidden">
      {/* 裝飾稻金斜線 */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 24px, #c49428 24px 25px)",
        }}
      />
      <div className="relative max-w-[1360px] mx-auto px-6 lg:px-12 py-16 lg:py-20 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
        <div>
          <p className="font-latin text-xs tracking-[0.24em] text-gold uppercase">
            B2B · 企業採購
          </p>
          <h2 className="mt-3 font-serif text-3xl lg:text-5xl leading-[1.25]">
            學校午餐、企業贈禮、團膳採購<br />
            <span className="text-gold">我們有另一條通路</span>
          </h2>
          <p className="mt-5 text-paper-warm/85 leading-[1.9] max-w-[520px]">
            月結、PO 單、階梯定價、食安履歷一鍵查詢——
            台灣鮮農 B2B 子站為企業客戶而生。
          </p>
          <a
            href="https://b2b.tfa.com.tw"
            target="_blank"
            rel="noopener"
            className="mt-8 inline-block px-8 h-12 leading-[48px] bg-vermillion hover:bg-vermillion-mid text-paper text-sm tracking-[0.14em] transition-colors"
          >
            前往企業採購 →
          </a>
        </div>
        <ul className="grid grid-cols-2 gap-5 text-sm">
          {[
            ["月結帳期", "30 / 60 天彈性"],
            ["階梯定價", "依量自動折扣"],
            ["食安履歷", "每批可溯"],
            ["專屬窗口", "1 對 1 客服"],
          ].map(([k, v]) => (
            <li key={k} className="border-l-2 border-gold pl-4 py-2">
              <p className="font-serif text-lg">{k}</p>
              <p className="text-xs text-paper-warm/70 mt-1 font-latin tracking-[0.1em]">{v}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
