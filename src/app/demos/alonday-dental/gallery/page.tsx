import Image from "next/image";
import { AlondayShell } from "@/components/demos/alonday/AlondayShell";
import { alonday } from "@/lib/alonday";

const shots = [
  [
    "/demos/alonday-dental/facade.jpg",
    "Public still of the clinic front. The hanging sign names Dr. Emma Aleli D. Alonday.",
  ],
  [
    "/demos/alonday-dental/chair.jpg",
    "Reference still: empty chair and operator stool. Filename ready to swap.",
  ],
  [
    "/demos/alonday-dental/operatory.jpg",
    "Reference still: panoramic film on a monitor beside an empty chair.",
  ],
  [
    "/demos/alonday-dental/chair-side.jpg",
    "Reference still: empty operatory. Not their room. Filename ready to swap.",
  ],
] as const;

export default function AlondayGallery() {
  return (
    <AlondayShell current="Gallery">
      <div className="alonday-page">
        <p className="alonday-kicker">Gallery</p>
        <h1 className="alonday-title">The front is theirs. The chairs are refs.</h1>
        <p className="alonday-lede">
          The bungalow still is a public listing photo of this clinic. The
          empty-chair pictures are licensed references, not their rooms, and
          the filenames stay ready if a Facebook still replaces them.
        </p>
        <ul className="alonday-gallery">
          {shots.map(([src, alt]) => (
            <li key={src}>
              <div className="alonday-shot">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 720px) 100vw, 50vw"
                />
              </div>
              <p className="alonday-shot-cap">{alt}</p>
            </li>
          ))}
        </ul>
        <p className="alonday-note alonday-foot">{alonday.sampleNote}</p>
      </div>
    </AlondayShell>
  );
}
