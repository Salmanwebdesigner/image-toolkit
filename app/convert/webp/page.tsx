import type { Metadata } from "next";

import { FormatConverterTool } from "@/components/tools/format-converter-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Convert Images to WebP Online – Fast & Private | Image Toolkit",
  description: "Convert JPG, JPEG, and PNG images to WebP instantly in your browser. Improve image performance and reduce file sizes without uploading files.",
};

export default function ConvertWebPPage() {
  return (
    <ToolPageShell
      eyebrow="Convert to WebP"
      title="Convert JPG, JPEG, and PNG to WebP"
      description="Use a dedicated conversion page for WebP output, resizing, quality tuning, previews, and instant local download."
    >
      <FormatConverterTool
        id="webp"
        eyebrow="Convert to WebP"
        title="Convert JPG, JPEG, and PNG to WebP"
        description="Generate WebP output locally with resize controls, adjustable quality, and instant before/after previews."
        targetMimeType="image/webp"
        accept=".jpg,.jpeg,.png"
        allowedTypes={["image/jpeg", "image/png"]}
        downloadLabel="Download WebP file"
      />
    </ToolPageShell>
  );
}
