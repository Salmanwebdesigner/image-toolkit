import type { Metadata } from "next";

import { FormatConverterTool } from "@/components/tools/format-converter-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Convert Images to PNG Online – Browser-Based Converter | Image Toolkit",
  description: "Convert JPG, JPEG, and WebP images to PNG locally in your browser. Preserve image quality and transparency with secure, private processing.",
};

export default function ConvertPngPage() {
  return (
    <ToolPageShell
      eyebrow="Convert to PNG"
      title="Convert JPG and WebP to PNG"
      description="Use a focused PNG conversion page with local resizing, preview, and instant download."
    >
      <FormatConverterTool
        id="png"
        eyebrow="Convert to PNG"
        title="Convert JPG and WebP to PNG"
        description="Create PNG output directly in the browser with resize controls and instant download."
        targetMimeType="image/png"
        accept=".jpg,.jpeg,.webp"
        allowedTypes={["image/jpeg", "image/webp"]}
        qualityEnabled={false}
        downloadLabel="Download PNG file"
      />
    </ToolPageShell>
  );
}
