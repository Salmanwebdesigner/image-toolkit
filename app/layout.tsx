import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "Image Toolkit | Browser-Based Compression, Conversion, Cropping & Resizing";
const siteDescription =
  "A premium browser-only image toolkit for free. Compress, convert, resize, crop, rotate, flip, inspect metadata, and bulk export images locally on your device.";
const siteUrl = "https://image-toolkit.local";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "image compressor",
    "webp converter",
    "png converter",
    "jpg converter",
    "avif converter",
    "bulk image conversion",
    "browser image editor",
    "next.js image toolkit",
  ],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Image Toolkit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
