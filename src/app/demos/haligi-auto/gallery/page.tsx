import Image from "next/image";
import { HaligiShell } from "@/components/demos/haligi/HaligiShell";

const shots = [
  ["/demos/haligi-auto/lift.jpg", "Wagon on a two-post lift"],
  ["/demos/haligi-auto/bay.jpg", "Open hood and coiled air line"],
  ["/demos/haligi-auto/oil-tools.jpg", "Stamped tool wall"],
  ["/demos/haligi-auto/engine.jpg", "Engine bay, grease light"],
] as const;

export default function HaligiGallery() {
  return (
    <HaligiShell current="Gallery">
      <div className="haligi-page pb-16">
        <h1 className="haligi-cond haligi-title">Bay photos</h1>
        <ul className="haligi-gallery">
          {shots.map(([src, alt]) => (
            <li key={src}>
              <div className="haligi-shot">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <p className="mt-3 text-sm text-[var(--mute)]">{alt}</p>
            </li>
          ))}
        </ul>
      </div>
    </HaligiShell>
  );
}
