"use client";

import { Download, FlipHorizontal2, FlipVertical2, LoaderCircle, RotateCcw, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

import { useNotifications } from "@/components/ui/notification-provider";
import { PreviewCard } from "@/components/ui/preview-card";
import { ToolShell } from "@/components/ui/tool-shell";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { downloadBlob } from "@/lib/download";
import { ensureImageFile, getImageMetadata, processImage, qualityPercentToDecimal } from "@/lib/image-utils";
import type { ImageMetadata, ProcessedImageResult } from "@/lib/types";

export function RotateFlipTool() {
  const { notify } = useNotifications();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

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

  useEffect(() => {
    if (!file) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const processed = await processImage({
          file,
          mimeType: file.type === "image/png" ? "image/png" : "image/jpeg",
          quality: file.type === "image/png" ? undefined : qualityPercentToDecimal(92),
          rotation,
          flipHorizontal,
          flipVertical,
          backgroundColor: file.type === "image/png" ? undefined : "#ffffff",
          fileName: file.name,
        });

        if (cancelled) {
          return;
        }

        setResult(processed);
        setResultUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
          }
          return URL.createObjectURL(processed.blob);
        });
      } catch (error) {
        if (!cancelled) {
          notify("error", error instanceof Error ? error.message : "Rotation failed.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 160);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [file, flipHorizontal, flipVertical, notify, rotation]);

  async function handleFilesSelected(files: File[]) {
    try {
      const nextFile = files[0];
      ensureImageFile(nextFile);
      const nextMetadata = await getImageMetadata(nextFile);
      setFile(nextFile);
      setMetadata(nextMetadata);
      setRotation(0);
      setFlipHorizontal(false);
      setFlipVertical(false);
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
      notify("success", "Image ready for rotation and flipping.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not open the image.");
    }
  }

  return (
    <ToolShell
      id="rotate"
      eyebrow="Rotate & Flip"
      title="Rotate left, rotate right, and mirror instantly"
      description="Apply quarter-turn rotations, flip horizontally or vertically, preview the result, and download the final edited file."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <UploadDropzone
            label="Upload an image to rotate or flip"
            helperText="Every transformation is rendered on-device with browser canvas APIs."
            onFilesSelected={handleFilesSelected}
          />
          <div className="glass-card p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className="button-secondary" onClick={() => setRotation((current) => current - 90)}>
                <RotateCcw className="size-4" />
                Rotate left
              </button>
              <button type="button" className="button-secondary" onClick={() => setRotation((current) => current + 90)}>
                <RotateCw className="size-4" />
                Rotate right
              </button>
              <button type="button" className="button-secondary" onClick={() => setFlipHorizontal((current) => !current)}>
                <FlipHorizontal2 className="size-4" />
                Flip horizontal
              </button>
              <button type="button" className="button-secondary" onClick={() => setFlipVertical((current) => !current)}>
                <FlipVertical2 className="size-4" />
                Flip vertical
              </button>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Rotation: <span className="font-semibold text-slate-900">{((rotation % 360) + 360) % 360}deg</span>
            </div>
          </div>
          {metadata && originalUrl ? (
            <div className="glass-card p-5">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Live transform preview</h3>
                <p className="mt-1 text-sm text-slate-600">
                  CSS preview matches the output that will be re-rendered for download.
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl bg-slate-100 p-4">
                <img
                  src={originalUrl}
                  alt={metadata.fileName}
                  className="mx-auto aspect-[4/3] h-full w-full object-contain transition duration-300"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className="space-y-6">
          <div className="glass-card p-5">
            {loading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-slate-600">
                <LoaderCircle className="size-7 animate-spin text-indigo-500" />
                <p className="font-medium">Rendering edited image locally...</p>
              </div>
            ) : result && resultUrl ? (
              <PreviewCard
                title="Edited output"
                src={resultUrl}
                alt="Edited output"
                details={[
                  `${result.width} x ${result.height}`,
                  result.outputMimeType.replace("image/", "").toUpperCase(),
                ]}
                fileSize={result.blob.size}
                actionLabel="Download edited image"
                onAction={() => downloadBlob(result.blob, result.suggestedFileName)}
              />
            ) : (
              <div className="flex min-h-[280px] items-center justify-center text-center text-slate-600">
                Edited output appears here automatically.
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
              Download edited image
            </button>
          ) : null}
        </div>
      </div>
    </ToolShell>
  );
}
