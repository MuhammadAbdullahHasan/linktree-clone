import type { Metadata } from "next";
import {
  Bebas_Neue,
  Caveat,
  DM_Serif_Display,
  Inter,
  JetBrains_Mono,
  Lora,
  Manrope,
  Montserrat,
  Nunito,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import { APP_NAME, siteUrl } from "@/lib/config";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
// Profile page fonts owners can pick in Appearance. Browsers only download the ones a page uses.
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const dmserif = DM_Serif_Display({ variable: "--font-dmserif", subsets: ["latin"], weight: "400" });
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400" });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

const fontVariables = [inter, nunito, lora, jetbrains, poppins, montserrat, manrope, grotesk, playfair, dmserif, bebas, caveat]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: `${APP_NAME} | One link for everything you do`,
  description: "Share all your links, socials and content from one simple page.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${fontVariables} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
