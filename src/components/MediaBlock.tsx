import type { QuestionMedia } from "../types";

interface MediaBlockProps {
  media: QuestionMedia[];
}

export function MediaBlock({ media }: MediaBlockProps) {
  if (!media || media.length === 0) return null;
  return (
    <div className="media-block">
      {media.map((m, i) => {
        if (m.type === "image") {
          return (
            <figure key={i} className="media-item media-image">
              <img src={m.src} alt={m.alt ?? m.caption ?? ""} loading="lazy" />
              {m.caption && <figcaption>{m.caption}</figcaption>}
            </figure>
          );
        }
        if (m.type === "video") {
          return (
            <figure key={i} className="media-item media-video">
              <video
                src={m.src}
                controls
                playsInline
                preload="metadata"
                poster={m.poster}
              />
              {m.caption && <figcaption>{m.caption}</figcaption>}
            </figure>
          );
        }
        if (m.type === "youtube") {
          const id = extractYouTubeId(m.src);
          if (!id) return null;
          return (
            <figure key={i} className="media-item media-video">
              <div className="media-embed">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  title={m.caption ?? "YouTube video"}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {m.caption && <figcaption>{m.caption}</figcaption>}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  if (/^[\w-]{11}$/.test(url)) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/embed\/([\w-]{11})/);
    if (m) return m[1];
  } catch {
    return null;
  }
  return null;
}
