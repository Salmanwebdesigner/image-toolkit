import type { Metadata } from "next";

import { RotateFlipTool } from "@/components/tools/rotate-flip-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Rotate & Flip Images Online – Free Image Editor | Image Toolkit",
  description: "Rotate images left or right and flip them horizontally or vertically. Edit photos instantly in your browser with no uploads required.",
};

export default function RotatePage() {
  return (
    <ToolPageShell
      eyebrow="Rotate & Flip"
      title="Rotate and flip images on a dedicated page"
      description="Make quick orientation edits with a focused workspace for rotation, mirroring, preview, and download."
    >
      <RotateFlipTool />
    </ToolPageShell>
  );
}
