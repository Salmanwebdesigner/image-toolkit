import type { Metadata } from "next";

import { CropTool } from "@/components/tools/crop-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Crop Images Online – Free Image Crop Tool | Image Toolkit",
  description: "Crop images using an interactive browser-based cropper. Choose freeform cropping or predefined aspect ratios while keeping your files private.",
};

export default function CropPage() {
  return (
    <ToolPageShell
      eyebrow="Crop"
      title="Crop images in a dedicated editing page"
      description="Use a focused crop workspace with freeform and preset aspect ratios, zoom control, and local export."
    >
      <CropTool />
    </ToolPageShell>
  );
}
