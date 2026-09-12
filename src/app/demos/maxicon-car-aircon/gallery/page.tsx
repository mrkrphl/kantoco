import Image from "next/image";
import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";

export default function MaxiconGallery() {
  return (
    <MaxiconShell>
      <div className="maxicon-page">
        <p className="maxicon-line">Their bay. Their parts.</p>
        <p className="maxicon-lede">
          These stills were published by the shop. No generated people, and no
          borrowed testimonials.
        </p>
      </div>
      <div className="maxicon-page-still">
        <Image
          src="/demos/maxicon-car-aircon/shop-front.jpg"
          alt="Maxicon’s open bay and sign on President’s Avenue."
          fill
          className="object-cover object-[center_28%]"
          sizes="100vw"
        />
      </div>
      <div className="maxicon-page-still">
        <Image
          src="/demos/maxicon-car-aircon/dash-work.jpg"
          alt="Dashboard pulled for evaporator work on a Toyota."
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="maxicon-page-still">
        <Image
          src="/demos/maxicon-car-aircon/compressor.jpg"
          alt="Compressor on the parts board, labeled Panasonic / Mazda 3."
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </MaxiconShell>
  );
}
