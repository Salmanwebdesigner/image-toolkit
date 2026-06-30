import type { Metadata } from "next";

import { FormatConverterTool } from "@/components/tools/format-converter-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Convert Images to AVIF Online – Modern Image Format | Image Toolkit",
  description: "Convert JPG, PNG, and WebP images to AVIF in supported browsers. Create smaller, high-quality images with modern compression technology.",
};

export default function ConvertAvifPage() {
  return (
    <ToolPageShell
      eyebrow="Convert to AVIF"
      title="Convert JPG and PNG to AVIF"
      description="Open a dedicated AVIF conversion page with local resizing, quality tuning, previews, and browser support checks."
    >
      <FormatConverterTool
        id="avif"
        eyebrow="Convert to AVIF"
        title="Convert JPG and PNG to AVIF"
        description="Export modern AVIF images in supported browsers with local resize and quality controls and no server dependency."
        targetMimeType="image/avif"
        accept=".jpg,.jpeg,.png"
        allowedTypes={["image/jpeg", "image/png"]}
        downloadLabel="Download AVIF file"
      />
    </ToolPageShell>
  );
}
