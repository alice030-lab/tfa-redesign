import { cn } from "@/lib/cn";

/**
 * 章節分隔
 * variant="line"   — 純線
 * variant="stamp"  — 線上帶朱紅印章（章節結尾、section 切換）
 */
export function Separator({
  variant = "line",
  stampText = "農",
  className,
}: {
  variant?: "line" | "stamp";
  stampText?: string;
  className?: string;
}) {
  if (variant === "line") {
    return <hr className={cn("border-0 border-t border-rule", className)} />;
  }
  return (
    <div className={cn("relative flex items-center justify-center my-10", className)}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-rule" />
      <span className="stamp-seal relative z-10">{stampText}</span>
    </div>
  );
}
