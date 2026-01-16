import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Check AI Overviews",
  description: "See which of your ranking keywords trigger Google's AI Overviews.",
  openGraph: {
    title: "Check AI Overviews",
    description: "See which of your ranking keywords trigger Google's AI Overviews.",
    url: "https://checkaioverviews.com",
    type: "website",
    siteName: "Check AI Overviews",
    images: [
      {
        url: "https://checkaioverviews.com/og-default.png",
        width: 1200,
        height: 630,
        alt: "Check AI Overviews - See which keywords trigger Google AI Overviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Check AI Overviews",
    description: "See which of your ranking keywords trigger Google's AI Overviews.",
    images: ["https://checkaioverviews.com/og-default.png"],
  },
  metadataBase: new URL("https://checkaioverviews.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
