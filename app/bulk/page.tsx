import type { Metadata } from "next";

import { BulkConversionTool } from "@/components/tools/bulk-conversion-tool";
import { ToolPageShell } from "@/components/ui/tool-page-shell";

export const metadata: Metadata = {
  title: "Bulk Image Converter – Convert Multiple Images at Once | Image Toolkit",
  description: "Convert multiple images in bulk directly in your browser. Export converted files together as a ZIP archive with no uploads or server processing.",
};

export default function BulkPage() {
  return (
    <ToolPageShell
      eyebrow="Bulk Conversion"
      title="Bulk convert images and export everything as ZIP"
      description="Use a focused batch workflow for multiple files, local conversion, progress tracking, and ZIP export."
    >
      <BulkConversionTool />
    </ToolPageShell>
  );
}
