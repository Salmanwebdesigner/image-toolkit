"use client";

import Cropper, { type Area } from "react-easy-crop";
import { Crop, Download, LoaderCircle, Scissors } from "lucide-react";
import { useEffect, useState } from "react";

import { useNotifications } from "@/components/ui/notification-provider";
import { PreviewCard } from "@/components/ui/preview-card";
import { ToolShell } from "@/components/ui/tool-shell";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { downloadBlob } from "@/lib/download";
import { ensureImageFile, getImageMetadata, processImage, qualityPercentToDecimal } from "@/lib/image-utils";
import type { ImageMetadata, ProcessedImageResult } from "@/lib/types";

const cropModes: Array<{ label: string; value: number | undefined }> = [
  { label: "Freeform", value: undefined },
  { label: "Square", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:5", value: 4 / 5 },
];

export function CropTool() {
  const { notify } = useNotifications();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [cropArea, setCropArea] = useState<Area | null>(null);

  useEffect(() => {
    return () => {
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [originalUrl, resultUrl]);

  async function handleFilesSelected(files: File[]) {
    try {
      const nextFile = files[0];
      ensureImageFile(nextFile);
      const nextMetadata = await getImageMetadata(nextFile);
      setFile(nextFile);
      setMetadata(nextMetadata);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropArea(null);
      setOriginalUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return URL.createObjectURL(nextFile);
      });
      setResult(null);
      setResultUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return null;
      });
      notify("success", "Image ready to crop.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not load the image.");
    }
  }

  async function applyCrop() {
    if (!file || !cropArea) {
      notify("error", "Adjust the crop area first.");
      return;
    }

    try {
      setLoading(true);
      const processed = await processImage({
        file,
        mimeType: file.type === "image/png" ? "image/png" : "image/jpeg",
        quality: file.type === "image/png" ? undefined : qualityPercentToDecimal(92),
        crop: {
          x: cropArea.x,
          y: cropArea.y,
          width: cropArea.width,
          height: cropArea.height,
        },
        backgroundColor: file.type === "image/png" ? undefined : "#ffffff",
        fileName: file.name,
      });

      setResult(processed);
      setResultUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return URL.createObjectURL(processed.blob);
      });
      notify("success", "Crop applied locally.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Crop failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      id="crop"
      eyebrow="Crop"
      title="Crop with freeform and aspect presets"
      description="Use an interactive crop surface with freeform, square, 16:9, and 4:5 aspect options before downloading the final image."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <UploadDropzone
            label="Upload an image to crop"
            helperText="Move, zoom, and crop directly in the browser. No uploads or server round-trips."
            onFilesSelected={handleFilesSelected}
          />
          <div className="glass-card p-5">
            <div className="flex flex-wrap gap-2">
              {cropModes.map((mode) => (
                <button
                  key={mode.label}
                  type="button"
                  className={`button-secondary ${aspect === mode.value ? "border-indigo-300 bg-indigo-50 text-indigo-700" : ""}`}
                  onClick={() => setAspect(mode.value)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-sm font-medium text-slate-700">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="mt-3 w-full accent-indigo-500"
              />
            </label>
            <div className="mt-5 flex gap-3">
              <button type="button" className="button-primary" onClick={applyCrop} disabled={!file || loading}>
                {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Crop className="size-4" />}
                Apply crop
              </button>
            </div>
          </div>
          <div className="glass-card overflow-hidden p-5">
            {originalUrl ? (
              <div className="relative h-[420px] overflow-hidden rounded-2xl bg-slate-950">
                <Cropper
                  image={originalUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedAreaPixels) => setCropArea(croppedAreaPixels)}
                  objectFit="contain"
                  showGrid
                />
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center text-slate-600">
                Interactive crop area appears here after upload.
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          {metadata && originalUrl ? (
            <PreviewCard
              title="Source image"
              src={originalUrl}
              alt={metadata.fileName}
              details={[`${metadata.width} x ${metadata.height}`, metadata.mimeType.replace("image/", "").toUpperCase()]}
              fileSize={metadata.fileSize}
            />
          ) : null}
          <div className="glass-card p-5">
            {result && resultUrl ? (
              <PreviewCard
                title="Cropped output"
                src={resultUrl}
                alt="Cropped output"
                details={[
                  `${result.width} x ${result.height}`,
                  result.outputMimeType.replace("image/", "").toUpperCase(),
                ]}
                fileSize={result.blob.size}
                actionLabel="Download cropped image"
                onAction={() => downloadBlob(result.blob, result.suggestedFileName)}
              />
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-slate-600">
                <Scissors className="size-7 text-indigo-500" />
                <p className="font-medium">Cropped output appears here after you apply the crop.</p>
              </div>
            )}
          </div>
          {result ? (
            <button
              type="button"
              className="button-primary w-full"
              onClick={() => downloadBlob(result.blob, result.suggestedFileName)}
            >
              <Download className="size-4" />
              Download cropped image
            </button>
          ) : null}
        </div>
      </div>
    </ToolShell>
  );
}
