"use client";

import { Download, LoaderCircle, Lock, LockOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ComparisonSlider } from "@/components/ui/comparison-slider";
import { useNotifications } from "@/components/ui/notification-provider";
import { PreviewCard } from "@/components/ui/preview-card";
import { ToolShell } from "@/components/ui/tool-shell";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { downloadBlob } from "@/lib/download";
import { ensureImageFile, getImageMetadata, processImage, qualityPercentToDecimal } from "@/lib/image-utils";
import { resizePresets } from "@/lib/presets";
import type { ImageMetadata, ProcessedImageResult } from "@/lib/types";

export function ResizeTool() {
  const { notify } = useNotifications();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

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
    if (!file || !width || !height) {
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
          width,
          height,
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
          notify("error", error instanceof Error ? error.message : "Resize failed.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [file, height, notify, width]);

  const aspectRatio = useMemo(() => {
    if (!metadata) {
      return null;
    }

    return metadata.width / metadata.height;
  }, [metadata]);

  async function handleFilesSelected(files: File[]) {
    try {
      const nextFile = files[0];
      ensureImageFile(nextFile);
      const nextMetadata = await getImageMetadata(nextFile);
      setFile(nextFile);
      setMetadata(nextMetadata);
      setWidth(nextMetadata.width);
      setHeight(nextMetadata.height);
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
      notify("success", "Image ready for resizing.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not open the image.");
    }
  }

  function updateWidth(nextWidth: number) {
    setWidth(nextWidth);
    if (lockAspectRatio && aspectRatio) {
      setHeight(Math.max(1, Math.round(nextWidth / aspectRatio)));
    }
  }

  function updateHeight(nextHeight: number) {
    setHeight(nextHeight);
    if (lockAspectRatio && aspectRatio) {
      setWidth(Math.max(1, Math.round(nextHeight * aspectRatio)));
    }
  }

  return (
    <ToolShell
      id="resize"
      eyebrow="Resize"
      title="Resize images for every social preset"
      description="Lock aspect ratio, enter exact dimensions, or apply one-click presets for Instagram, LinkedIn, Facebook, and YouTube."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <UploadDropzone
            label="Upload an image to resize"
            helperText="Dimension updates render locally in real time, with no server processing."
            onFilesSelected={handleFilesSelected}
          />
          <div className="glass-card p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Width
                <input
                  type="number"
                  min={1}
                  className="field mt-2"
                  value={width || ""}
                  onChange={(event) => updateWidth(Number(event.target.value))}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Height
                <input
                  type="number"
                  min={1}
                  className="field mt-2"
                  value={height || ""}
                  onChange={(event) => updateHeight(Number(event.target.value))}
                />
              </label>
            </div>
            <button
              type="button"
              className="button-secondary mt-4"
              onClick={() => setLockAspectRatio((current) => !current)}
            >
              {lockAspectRatio ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
              {lockAspectRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"}
            </button>
            <div className="mt-5">
              <p className="text-sm font-medium text-slate-900">Presets</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {resizePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setWidth(preset.width);
                      setHeight(preset.height);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {metadata && originalUrl ? (
            <PreviewCard
              title="Source image"
              src={originalUrl}
              alt={metadata.fileName}
              details={[`${metadata.width} x ${metadata.height}`, metadata.mimeType.replace("image/", "").toUpperCase()]}
              fileSize={metadata.fileSize}
            />
          ) : null}
        </div>
        <div className="space-y-6">
          <div className="glass-card p-5">
            {loading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-slate-600">
                <LoaderCircle className="size-7 animate-spin text-indigo-500" />
                <p className="font-medium">Resizing image locally...</p>
              </div>
            ) : result && resultUrl && originalUrl ? (
              <>
                <PreviewCard
                  title="Resized output"
                  src={resultUrl}
                  alt="Resized output"
                  details={[
                    `${result.width} x ${result.height}`,
                    result.outputMimeType.replace("image/", "").toUpperCase(),
                  ]}
                  fileSize={result.blob.size}
                  actionLabel="Download resized image"
                  onAction={() => downloadBlob(result.blob, result.suggestedFileName)}
                />
                <div className="mt-6">
                  <ComparisonSlider beforeSrc={originalUrl} afterSrc={resultUrl} />
                </div>
              </>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center text-center text-slate-600">
                Resized preview appears here automatically.
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
              Download resized image
            </button>
          ) : null}
        </div>
      </div>
    </ToolShell>
  );
}
