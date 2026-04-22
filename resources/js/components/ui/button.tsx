import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost" | "cta";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // 主行動：松墨綠 solid
  solid:   "bg-pine text-paper hover:bg-pine-mid",
  // 次行動：墨綠描邊
  outline: "border border-pine text-pine hover:bg-pine-light",
  // 第三行動：文字鈕
  ghost:   "text-ink-mid hover:text-ink hover:bg-paper-warm",
  // CTA：朱紅（全站唯一，限「加入購物車 / 立即購買 / 追蹤」）
  cta:     "bg-vermillion text-paper hover:bg-vermillion-mid",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-14 px-8 text-lg",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "solid", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium",
        "tracking-[0.08em] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
