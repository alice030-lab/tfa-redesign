import { cn } from "@/lib/cn";

type Variant = "default" | "pine" | "vermillion" | "gold";

const VARIANTS: Record<Variant, string> = {
  default:    "border border-rule text-ink-mid bg-paper-card",
  pine:       "border border-pine/30 text-pine bg-pine-light",
  vermillion: "border border-vermillion/30 text-vermillion bg-vermillion-pale",
  gold:       "border border-gold/40 text-gold bg-gold-pale",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium",
        "tracking-[0.08em]",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
