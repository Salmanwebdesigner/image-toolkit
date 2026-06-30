import type { Metadata } from "next";

import { ResizeTool } from "@/components/tools/resize-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Resize Images Online – Custom Dimensions & Presets | Image Toolkit",
  description: "Resize images with exact dimensions or popular social media presets. Fast, private, browser-based image resizing without quality loss.",
};

export default function ResizePage() {
  return (
    <ToolPageShell
      eyebrow="Resize"
      title="Resize images with exact dimensions and presets"
      description="Open a simpler dedicated resize page for manual dimensions, locked aspect ratio, and social media sizes."
    >
      <ResizeTool />
    </ToolPageShell>
  );
}
