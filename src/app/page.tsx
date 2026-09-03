import { Outfit, Syne } from "next/font/google";
import { HomeExperience } from "@/components/home/HomeExperience";
import "./home.css";

const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-home-display",
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-home-body",
});

export default function Home() {
  return (
    <div className={`${display.variable} ${body.variable}`}>
      <HomeExperience />
    </div>
  );
}
