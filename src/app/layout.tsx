import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Lora, Nunito } from "next/font/google";
import { APP_NAME, siteUrl } from "@/lib/config";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: `${APP_NAME} | One link for everything you do`,
  description: "Share all your links, socials and content from one simple page.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${nunito.variable} ${lora.variable} ${jetbrains.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
