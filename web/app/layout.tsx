import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { site } from "@/lib/site-config";
import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | Apartments in Larose, LA`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "J&M Rentals",
    "Larose LA apartments",
    "rentals Larose Louisiana",
    "bayou apartments",
    "S Main St Larose",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: site.name,
    title: `${site.name} | Apartments in Larose, LA`,
    description: site.description,
    images: [
      {
        url: "/images/Outside.jpg",
        width: 2048,
        height: 1537,
        alt: "J&M Rentals property in Larose, Louisiana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Larose, LA`,
    description: site.description,
    images: ["/images/Outside.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-gold focus:text-navy focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
