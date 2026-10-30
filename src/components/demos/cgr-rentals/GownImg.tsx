"use client";

import { useCallback, useState } from "react";
import { CGR_ASSET, type GownImage } from "@/lib/cgr-rentals";

/**
 * r7.9: a gown photo's URL. Every gown photo is a whole shop photo
 * (photos/cgr-gown-*), never a crop. The photos ship as a separate binaries
 * push; if one is not on the server yet, the 404 is caught (in onError, or
 * in the ref when it fired before hydration) and the img is marked
 * data-missing, which CSS hides, so the box shows its plain backdrop instead
 * of a broken image. There is no fallback to the retired crops.
 */
export function useGownSrc(img: GownImage | null | undefined) {
  const file = img?.file ?? "";
  const [failed, setFailed] = useState<string | null>(null);
  const missing = !!file && failed === file;
  const src = img ? `${CGR_ASSET}/${img.file}.webp` : "";

  const onError = useCallback(() => {
    if (file) setFailed(file);
  }, [file]);

  const ref = useCallback(
    (el: HTMLImageElement | null) => {
      if (el && file && el.complete && el.naturalWidth === 0 && el.currentSrc.includes(file)) setFailed(file);
    },
    [file],
  );

  return { src, onError, ref, missing };
}

type ImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height" | "ref" | "onError">;

/** A gown photo <img> (for lists, where a hook per item can't run). */
export function GownImg({ img, alt, ...rest }: { img: GownImage } & ImgProps) {
  const { src, onError, ref, missing } = useGownSrc(img);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local webp, fixed-size box
    <img
      ref={ref}
      src={src}
      onError={onError}
      alt={alt ?? img.alt}
      width={img.w}
      height={img.h}
      data-missing={missing ? "true" : undefined}
      {...rest}
    />
  );
}
