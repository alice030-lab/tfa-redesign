import { useState } from "react";
import { cn } from "@/lib/cn";

type Props = { photos: string[]; alt?: string };

/**
 * 相簿 — 混合尺寸 grid（仿平面排版）
 * 點圖開 Lightbox（簡易版）
 */
export function FarmerGallery({ photos, alt = "" }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) return null;

  return (
    <section className="bg-paper">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16">
        <header className="mb-8">
          <p className="font-latin text-xs text-ink-light tracking-[0.2em] uppercase">Gallery</p>
          <h2 className="font-serif text-3xl text-ink mt-1">田裡的日子</h2>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {photos.map((src, i) => {
            // 每 3 格出現一張雙寬的，做出節奏感
            const span = i % 5 === 0 ? "col-span-2 row-span-2" : "";
            return (
              <button
                key={src}
                onClick={() => setOpen(i)}
                className={cn(
                  "overflow-hidden bg-paper-warm aspect-square",
                  span,
                  "hover:opacity-90 transition-opacity"
                )}
              >
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-6"
          onClick={() => setOpen(null)}
        >
          <img src={photos[open]} alt={alt} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </section>
  );
}
