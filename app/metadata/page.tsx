import type { Metadata } from "next";

import { MetadataViewerTool } from "@/components/tools/metadata-viewer-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Image Metadata Viewer – Inspect Image Details Online | Image Toolkit",
  description: "View image metadata including file size, dimensions, format, MIME type, and modification date. Analyze images securely in your browser.",
};

export default function MetadataPage() {
  return (
    <ToolPageShell
      eyebrow="Metadata"
      title="Inspect image metadata on its own page"
      description="Open a simple metadata viewer workspace for file details, resolution, mime type, and modified date."
    >
      <MetadataViewerTool />
    </ToolPageShell>
  );
}
