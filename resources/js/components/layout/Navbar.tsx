import { useState } from "react";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "農友", href: "/farmers" },
  { label: "商品", href: "/products" },
  { label: "節氣選品", href: "/seasonal" },
  { label: "農友日誌", href: "/journal" },
  { label: "企業採購", href: "https://b2b.tfa.com.tw", external: true },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-paper border-b border-rule-dark">
      <div className="max-w-[1360px] mx-auto h-16 lg:h-20 px-5 lg:px-12 flex items-center gap-8">
        {/* 品牌徽章 */}
        <a href="/" className="flex items-center gap-3 shrink-0">
          <span className="flex flex-col items-center justify-center w-11 h-11 border-[1.5px] border-pine">
            <span className="font-serif text-[11px] text-pine leading-none">鮮農</span>
            <span className="font-latin text-[7px] text-pine tracking-[0.1em] mt-0.5">TFA</span>
          </span>
          <span className="hidden sm:block font-serif text-lg text-ink">台灣鮮農</span>
        </a>

        {/* 桌機導覽 */}
        <ul className="hidden lg:flex items-center gap-7 flex-1">
          {NAV.map((n) => (
            <li key={n.label}>
              <a
                href={n.href}
                className="text-sm text-ink-mid hover:text-vermillion transition-colors tracking-[0.12em]"
                {...(n.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        {/* 右側動作 */}
        <div className="ml-auto flex items-center gap-4">
          <button aria-label="搜尋" className="hidden sm:block text-ink-mid hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-5-5" />
            </svg>
          </button>
          <a href="/cart" aria-label="購物車" className="relative text-ink-mid hover:text-ink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L22 8H6" />
              <circle cx="10" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
            </svg>
            <span className="absolute -top-1 -right-1 text-[10px] font-latin bg-vermillion text-paper w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </a>
          <a href="/login" className="hidden sm:block text-sm text-ink-mid hover:text-vermillion">登入</a>

          {/* 手機漢堡 */}
          <button
            className="lg:hidden text-ink"
            onClick={() => setOpen((o) => !o)}
            aria-label="選單"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M3 6h18M3 12h18M3 18h18" /></>}
            </svg>
          </button>
        </div>
      </div>

      {/* 手機下拉 */}
      <div className={cn("lg:hidden overflow-hidden transition-all", open ? "max-h-96 border-t border-rule" : "max-h-0")}>
        <ul className="px-5 py-4 space-y-3">
          {NAV.map((n) => (
            <li key={n.label}>
              <a href={n.href} className="block py-1 text-ink">{n.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
