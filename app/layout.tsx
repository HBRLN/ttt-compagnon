import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import NavigationGeste from "@/components/NavigationGeste";
import "./globals.css";

// Une seule grotesque, comme le veut la recette suisse. Space Grotesk
// plutôt qu'une Helvetica : elle garde la neutralité de la grille mais
// ses détails la font lire moderne, ce qui corrige le principal reproche
// fait au style suisse aujourd'hui (« classique, archivistique »).
// Graisses utilisées : 400 et 500 seulement — jamais au-delà, c'est le
// garde-fou contre le registre sportswear.
const police = Space_Grotesk({
  variable: "--police",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Compagnon",
  description: "Le compagnon de RDV du tatoueur indépendant",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Compagnon",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f2f2f0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${police.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-fond text-encre font-sans">
        <NavigationGeste>{children}</NavigationGeste>
      </body>
    </html>
  );
}
