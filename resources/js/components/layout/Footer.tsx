const COLS = [
  {
    title: "關於",
    items: ["品牌故事", "合作農友", "溯源理念", "媒體報導"],
  },
  {
    title: "購物",
    items: ["全部商品", "節氣選品", "禮盒專區", "運送與退換"],
  },
  {
    title: "企業",
    items: ["B2B 採購", "學校午餐", "企業贈禮", "聯絡窗口"],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-paper-warm">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16 lg:py-20 grid lg:grid-cols-[2fr_3fr_2fr] gap-12">
        {/* 品牌 */}
        <div>
          <div className="flex items-center gap-3">
            <span className="flex flex-col items-center justify-center w-12 h-12 border-[1.5px] border-paper-warm/60">
              <span className="font-serif text-xs leading-none">鮮農</span>
              <span className="font-latin text-[8px] tracking-[0.1em] mt-0.5">TFA</span>
            </span>
            <span className="font-serif text-xl">台灣鮮農</span>
          </div>
          <p className="mt-5 text-sm leading-[1.9] text-paper-warm/70">
            台灣農業合作社聯合授權平台<br />
            串連在地農友，把人的故事與土地的味道，送到每一個家。
          </p>
          <address className="mt-5 text-xs not-italic text-paper-warm/60 font-latin leading-[1.9]">
            台南市東區 東門路三段 31 號 4F-1<br />
            +886-6-234-0161
          </address>
        </div>

        {/* 連結群 */}
        <div className="grid grid-cols-3 gap-6">
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="font-latin text-xs tracking-[0.18em] text-paper-warm/50 uppercase mb-4">
                {c.title}
              </p>
              <ul className="space-y-2.5">
                {c.items.map((x) => (
                  <li key={x}>
                    <a href="#" className="text-sm hover:text-vermillion transition-colors">{x}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 訂閱 */}
        <div>
          <p className="font-latin text-xs tracking-[0.18em] text-paper-warm/50 uppercase mb-4">
            Newsletter
          </p>
          <p className="text-sm text-paper-warm/80 mb-4">
            訂閱我們，每月一封，告訴你本季誰家的田裡有新消息。
          </p>
          <form className="flex gap-0">
            <input
              type="email"
              placeholder="你的 email"
              className="flex-1 min-w-0 bg-paper-warm/10 border border-paper-warm/20 px-3 h-11 text-sm text-paper placeholder:text-paper-warm/40 focus:outline-none focus:border-vermillion"
            />
            <button
              type="button"
              className="h-11 px-5 bg-vermillion text-paper text-sm tracking-[0.1em] hover:bg-vermillion-mid"
            >
              訂閱
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-paper-warm/10">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-paper-warm/50 font-latin">
          <span>© 2026 Taiwan Freshness Agriculture · All rights reserved.</span>
          <span className="flex gap-5">
            <a href="#" className="hover:text-paper">Privacy</a>
            <a href="#" className="hover:text-paper">Terms</a>
            <a href="#" className="hover:text-paper">Facebook</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
