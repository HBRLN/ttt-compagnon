import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import NavigationGeste from "@/components/NavigationGeste";
import "./globals.css";

// Une seule famille sur toute l'amplitude 400→900 : le contraste vient du
// poids et de l'échelle, pas d'un deuxième caractère. C'est ce qui tient
// la direction brutaliste ensemble.
const police = Archivo({
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
  themeColor: "#0a0a0a",
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
