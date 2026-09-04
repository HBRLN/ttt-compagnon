import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import NavigationGeste from "@/components/NavigationGeste";
import "./globals.css";

// Instrument Serif ne existe qu'en 400 : la hiérarchie se fait à la taille,
// jamais au gras — un `font-bold` dessus déclencherait un faux gras
// synthétisé par le navigateur.
const policeTitre = Instrument_Serif({
  variable: "--police-titre",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
});

const policeUi = Instrument_Sans({
  variable: "--police-ui",
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
  themeColor: "#faf8f5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${policeTitre.variable} ${policeUi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-fond text-encre font-sans">
        <NavigationGeste>{children}</NavigationGeste>
      </body>
    </html>
  );
}
