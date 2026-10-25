import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { siteUrl } from "@/lib/links";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Cultiva Digital — vitrine on-line para quem vende plantas",
    template: "%s · Cultiva Digital",
  },
  description:
    "Monte grátis a vitrine das suas plantas e terrários, compartilhe o link no Instagram e receba pedidos pelo WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#f6f4ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
