import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "@/styles/globals.css";

// Self-hosted at build time by next/font, so a visitor's browser never contacts
// Google. One less third party seeing who is writing a resume.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crivai",
  description:
    "Gerador de currículos gratuito e ATS-friendly para o mercado brasileiro.",
};

// The site always opens in pt-BR regardless of browser language (CLAUDE.md § 1).
// `lang` becomes dynamic when the locale toggle lands in Phase 1.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${plexSans.variable} h-full antialiased`}>
      <body className="font-sans flex min-h-full flex-col">{children}</body>
    </html>
  );
}
