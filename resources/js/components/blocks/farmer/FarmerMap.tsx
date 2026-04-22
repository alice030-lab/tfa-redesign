import type { Farmer } from "@/types/farmer";

type Props = Pick<Farmer["location"], "region" | "coords">;

/**
 * 產地地圖
 * 有 coords → 顯示 OSM 靜態 iframe
 * 無 coords → fallback 大地名章
 */
export function FarmerMap({ region, coords }: Props) {
  if (!coords) {
    return (
      <div className="aspect-[4/3] bg-paper-warm border border-rule flex items-center justify-center">
        <p className="font-serif text-3xl text-pine">{region}</p>
      </div>
    );
  }

  const [lat, lng] = coords;
  const bbox = `${lng - 0.05},${lat - 0.04},${lng + 0.05},${lat + 0.04}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${lat},${lng}&layer=mapnik`;

  return (
    <div className="aspect-[4/3] bg-paper-warm border border-rule overflow-hidden">
      <iframe src={src} title={`${region} 地圖`} className="w-full h-full" loading="lazy" />
    </div>
  );
}
