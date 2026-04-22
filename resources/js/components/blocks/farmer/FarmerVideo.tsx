import type { Video } from "@/types/farmer";
import { cn } from "@/lib/cn";

type Props = { videos: Video[] };

/**
 * 影音區：自適應
 *   0 支 → 回傳 null（整區不顯示）
 *   1 支 → 居中大直式，自動播放靜音
 *   2+ 支 → 橫向 Reels 牆
 */
export function FarmerVideo({ videos }: Props) {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="bg-paper">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <header className="mb-10 text-center">
          <p className="font-latin text-xs text-ink-light tracking-[0.2em] uppercase">
            Video
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl text-ink mt-2">田裡的畫面</h2>
        </header>

        {videos.length === 1 ? <SingleVideo video={videos[0]} /> : <VideoWall videos={videos} />}
      </div>
    </section>
  );
}

function SingleVideo({ video }: { video: Video }) {
  return (
    <div className="flex justify-center">
      <figure className="w-full max-w-[360px]">
        <div className={cn("aspect-[9/16] bg-ink overflow-hidden rounded-md")}>
          <video
            src={video.src}
            poster={video.poster}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        {video.caption && (
          <figcaption className="mt-3 text-center text-sm text-ink-mid">
            {video.caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

function VideoWall({ videos }: { videos: Video[] }) {
  return (
    <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
      {videos.map((v, i) => (
        <figure key={i} className="w-[280px] shrink-0 snap-start">
          <div className="aspect-[9/16] bg-ink overflow-hidden rounded-md">
            <video
              src={v.src}
              poster={v.poster}
              muted
              playsInline
              loop
              className="w-full h-full object-cover"
              onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
              onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
            />
          </div>
          {v.caption && (
            <figcaption className="mt-2 text-sm text-ink-mid">{v.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
