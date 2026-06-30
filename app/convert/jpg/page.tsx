import type { Metadata } from "next";

import { FormatConverterTool } from "@/components/tools/format-converter-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Convert Images to JPG Online – Free JPG Converter | Image Toolkit",
  description: "Convert PNG, WebP, and other image formats to JPG directly in your browser. Flatten transparency onto white backgrounds and export high-quality JPG files.",
};

export default function ConvertJpgPage() {
  return (
    <ToolPageShell
      eyebrow="Convert to JPG"
      title="Convert PNG and WebP to JPG"
      description="Use a dedicated JPG conversion page that flattens transparent areas onto white, supports resizing, and exports locally."
    >
      <FormatConverterTool
        id="jpg"
        eyebrow="Convert to JPG"
        title="Convert PNG and WebP to JPG with white background"
        description="Flatten transparent images onto a white canvas, resize them, tune quality, and export a clean JPG file locally."
        targetMimeType="image/jpeg"
        accept=".png,.webp"
        allowedTypes={["image/png", "image/webp"]}
        backgroundColor="#ffffff"
        downloadLabel="Download JPG file"
      />
    </ToolPageShell>
  );
}
