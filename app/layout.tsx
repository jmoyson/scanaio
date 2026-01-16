import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScanAIO - AI Overview Scanner",
  description: "See which of your ranking keywords trigger Google's AI Overviews.",
  openGraph: {
    title: "ScanAIO - AI Overview Scanner",
    description: "See which of your ranking keywords trigger Google's AI Overviews.",
    url: "https://scanaio.com",
    type: "website",
    siteName: "ScanAIO",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScanAIO - AI Overview Scanner",
    description: "See which of your ranking keywords trigger Google's AI Overviews.",
  },
  metadataBase: new URL("https://scanaio.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {/* Umami Analytics - only loads if NEXT_PUBLIC_UMAMI_WEBSITE_ID is set */}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            defer
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js"}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
