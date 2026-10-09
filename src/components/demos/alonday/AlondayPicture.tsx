import type { ImgSrc } from "@/lib/alonday-images";

const PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type Only = "all" | "min-768" | "min-1024" | "max-1023";

type AlondayPictureProps = {
  src?: ImgSrc;
  desktop?: ImgSrc;
  desktop1x?: ImgSrc;
  mobile?: ImgSrc;
  alt: string;
  sizes: string;
  className?: string;
  position?: string;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "lazy" | "eager";
  only?: Only;
};

function srcSet(file: ImgSrc, oneX?: ImgSrc) {
  if (!oneX) return undefined;
  return `${oneX.webp} ${oneX.w}w, ${file.webp} ${file.w}w`;
}

function srcSetJpg(file: ImgSrc, oneX?: ImgSrc) {
  if (!oneX) return undefined;
  return `${oneX.jpg} ${oneX.w}w, ${file.jpg} ${file.w}w`;
}

export function AlondayPicture({
  src,
  desktop,
  desktop1x,
  mobile,
  alt,
  sizes,
  className,
  position,
  fetchPriority = "auto",
  loading = "lazy",
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

  const webpSet = srcSet(wide, desktop1x);
  const jpgSet = srcSetJpg(wide, desktop1x);

  return (
    <picture>
      {media ? (
        <>
          <source
            media={media}
            type="image/webp"
            srcSet={webpSet ?? wide.webp}
            sizes={webpSet ? sizes : undefined}
          />
          <source
            media={media}
            type="image/jpeg"
            srcSet={jpgSet ?? wide.jpg}
            sizes={jpgSet ? sizes : undefined}
          />
        </>
      ) : (
        <source
          type="image/webp"
          srcSet={webpSet ?? wide.webp}
          sizes={webpSet ? sizes : undefined}
        />
      )}
      {split ? <source type="image/webp" srcSet={narrow.webp} /> : null}
      <img
        className={className}
        src={gated ? PIXEL : narrow.jpg}
        alt={alt}
        width={narrow.w}
        height={narrow.h}
        sizes={sizes}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        style={position ? { objectPosition: position } : undefined}
      />
    </picture>
  );
}
