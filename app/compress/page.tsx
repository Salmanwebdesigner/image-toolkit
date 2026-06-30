import type { Metadata } from "next";

import { CompressionTool } from "@/components/tools/compression-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Image Compressor Online – Reduce Image Size Without Uploads | Image Toolkit",
  description: "Compress JPG, PNG, WebP, and AVIF images directly in your browser. Reduce file size with adjustable quality settings, live savings statistics, and complete privacy.",
};

export default function CompressPage() {
  return (
    <ToolPageShell
      eyebrow="Compression"
      title="Compress images in a dedicated workspace"
      description="Adjust quality, compare before and after for single files, or compress a guarded batch locally into one ZIP download."
    >
      <CompressionTool />
    </ToolPageShell>
  );
}
