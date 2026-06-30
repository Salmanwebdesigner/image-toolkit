import type { Metadata } from "next";

import ImageToolkitApp from "@/components/image-toolkit-app";

export const metadata: Metadata = {
  title: "Image Toolkit - Compress, Convert, Resize & Edit Images Privately",
  description:
    "Compress, convert, crop, resize, rotate, flip, and optimize images directly in your browser. Fast, secure, and private image processing with no uploads or server-side processing.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Image Toolkit",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Browser-only image compression, conversion, resize, crop, rotate, flip, metadata viewing, and bulk ZIP export.",
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ImageToolkitApp />
    </>
  );
}
