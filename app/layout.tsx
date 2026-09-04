import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import NavigationGeste from "@/components/NavigationGeste";
import "./globals.css";

// La recette Apple s'appuie sur SF Pro, qui n'est pas distribuable.
// Geist en est l'équivalent le plus proche disponible : même neutralité
// géométrique, mêmes chiffres, dessinée pour l'écran. Graisses utilisées :
// 400, 500 et 600 — jamais au-delà.
const police = Geist({
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
  themeColor: "#ffffff",
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
