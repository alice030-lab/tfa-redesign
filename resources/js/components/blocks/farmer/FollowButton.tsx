import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  slug: string;
  initialCount: number;
  initialFollowed?: boolean;
};

/**
 * 追蹤按鈕 — MVP 版（B 方案）
 * - UI 樂觀更新
 * - 未登入觸發登入 modal（此處以 prompt 替代）
 * - 實際 POST /api/farmers/{slug}/follow 由 Inertia 或 fetch 串接
 */
export function FollowButton({ slug, initialCount, initialFollowed = false }: Props) {
  const [followed, setFollowed] = useState(initialFollowed);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    // 樂觀更新
    const next = !followed;
    setFollowed(next);
    setCount((c) => c + (next ? 1 : -1));

    try {
      await fetch(`/api/farmers/${slug}/follow`, {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // 回滾
      setFollowed(!next);
      setCount((c) => c + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant={followed ? "outline" : "cta"} onClick={toggle} disabled={busy}>
      {followed ? "已追蹤" : "追蹤"}
      <span className="font-latin opacity-80">· {count.toLocaleString()}</span>
    </Button>
  );
}
