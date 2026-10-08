type Src = {
  webp: string;
  jpg: string;
  w: number;
  h: number;
};

type AlondayPictureProps = {
  desktop: Src;
  mobile: Src;
  alt: string;
  sizes: string;
  frameClass?: string;
  parallax?: string;
};

export function AlondayPicture({
  desktop,
  mobile,
  alt,
  sizes,
  frameClass,
  parallax,
}: AlondayPictureProps) {
  return (
    <div
      className={["alonday-frame", frameClass].filter(Boolean).join(" ")}
      data-parallax={parallax}
    >
      <picture>
        <source
          media="(min-width: 768px)"
          type="image/webp"
          srcSet={desktop.webp}
        />
        <source
          media="(min-width: 768px)"
          type="image/jpeg"
          srcSet={desktop.jpg}
        />
        <source type="image/webp" srcSet={mobile.webp} />
        <img
          src={mobile.jpg}
          alt={alt}
          width={mobile.w}
          height={mobile.h}
          sizes={sizes}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      </picture>
    </div>
  );
}
