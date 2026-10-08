import type { ImgSrc } from "@/lib/alonday-images";

const PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type Only = "all" | "min-768" | "min-1024" | "max-1023";

type AlondayPictureProps = {
  src?: ImgSrc;
  desktop?: ImgSrc;
  mobile?: ImgSrc;
  alt: string;
  sizes: string;
  className?: string;
  position?: string;
  fetchPriority?: "high" | "low" | "auto";
  only?: Only;
};

export function AlondayPicture({
  src,
  desktop,
  mobile,
  alt,
  sizes,
  className,
  position,
  fetchPriority = "auto",
  only = "all",
}: AlondayPictureProps) {
  const wide = desktop ?? src;
  const narrow = mobile ?? src;
  if (!wide || !narrow) return null;

  const gated = only === "min-1024" || only === "max-1023";
  const split = only === "all" && wide !== narrow;
  const media =
    only === "min-1024"
      ? "(min-width: 1024px)"
      : only === "max-1023"
        ? "(max-width: 1023px)"
        : split || only === "min-768"
          ? "(min-width: 768px)"
          : null;

  return (
    <picture>
      {media ? (
        <>
          <source media={media} type="image/webp" srcSet={wide.webp} />
          <source media={media} type="image/jpeg" srcSet={wide.jpg} />
        </>
      ) : (
        <source type="image/webp" srcSet={wide.webp} />
      )}
      {split ? <source type="image/webp" srcSet={narrow.webp} /> : null}
      <img
        className={className}
        src={gated ? PIXEL : narrow.jpg}
        alt={alt}
        width={narrow.w}
        height={narrow.h}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        fetchPriority={fetchPriority}
        style={position ? { objectPosition: position } : undefined}
      />
    </picture>
  );
}
