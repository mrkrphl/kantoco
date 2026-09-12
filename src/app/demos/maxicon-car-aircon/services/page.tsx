import Image from "next/image";
import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";
import { maxicon } from "@/lib/maxicon";

export default function MaxiconServices() {
  return (
    <MaxiconShell>
      <div className="maxicon-page">
        <p className="maxicon-line">
          They sell the part. They open the system. The recharge waits.
        </p>
        <p className="maxicon-lede">
          There are no sample rates here. A live shop writes its own board.{" "}
          {maxicon.recentPost} Their Facebook page is the live record of jobs.
        </p>
      </div>
      <div className="maxicon-page-still">
        <Image
          src="/demos/maxicon-car-aircon/compressor.jpg"
          alt="A car aircon compressor on a parts board, photographed by the shop."
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <p className="maxicon-note maxicon-foot">{maxicon.sampleNote}</p>
    </MaxiconShell>
  );
}
