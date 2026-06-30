"use client";

import { Download, LoaderCircle, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ComparisonSlider } from "@/components/ui/comparison-slider";
import { useNotifications } from "@/components/ui/notification-provider";
import { PreviewCard } from "@/components/ui/preview-card";
import { ToolShell } from "@/components/ui/tool-shell";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { downloadBlob } from "@/lib/download";
import {
  ensureImageFile,
  formatBytes,
  getImageMetadata,
  isMimeTypeSupported,
  processImage,
  qualityPercentToDecimal,
} from "@/lib/image-utils";
import type { ImageMetadata, OutputMimeType, ProcessedImageResult, ResizeMode } from "@/lib/types";

interface FormatConverterToolProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  targetMimeType: OutputMimeType;
  accept: string;
  allowedTypes: string[];
  qualityEnabled?: boolean;
  backgroundColor?: string;
  downloadLabel: string;
}

export function FormatConverterTool({
  id,
  eyebrow,
  title,
  description,
  targetMimeType,
  accept,
  allowedTypes,
  qualityEnabled = true,
  backgroundColor,
  downloadLabel,
}: FormatConverterToolProps) {
  const { notify } = useNotifications();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [quality, setQuality] = useState(86);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [resizeMode, setResizeMode] = useState<ResizeMode>("fit");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [loading, setLoading] = useState(false);

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
        const supported = await isMimeTypeSupported(targetMimeType);

        if (!supported) {
          throw new Error(`This browser cannot export ${targetMimeType.replace("image/", "").toUpperCase()}.`);
        }

        const processed = await processImage({
          file,
          mimeType: targetMimeType,
          quality: qualityEnabled ? qualityPercentToDecimal(quality) : undefined,
          width,
          height,
          resizeMode,
          backgroundColor,
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
          notify("error", error instanceof Error ? error.message : "Conversion failed.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [backgroundColor, file, height, notify, quality, qualityEnabled, resizeMode, targetMimeType, width]);

  const fileStats = useMemo(() => {
    if (!file || !result) {
      return null;
    }

    return {
      original: formatBytes(file.size),
      converted: formatBytes(result.blob.size),
    };
  }, [file, result]);

  async function handleFilesSelected(files: File[]) {
    try {
      const nextFile = files[0];
      ensureImageFile(nextFile);

      if (!allowedTypes.includes(nextFile.type)) {
        throw new Error("This converter does not support the selected input format.");
      }

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
      notify("success", `${nextFile.name} is ready to convert.`);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not open the image.");
    }
  }

  return (
    <ToolShell id={id} eyebrow={eyebrow} title={title} description={description}>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <UploadDropzone
            label="Choose an image to convert"
            helperText="The image is decoded, converted, and downloaded entirely in the browser."
            accept={accept}
            onFilesSelected={handleFilesSelected}
          />
          {qualityEnabled ? (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Quality control</p>
                  <p className="mt-1 text-sm text-slate-600">Adjust output balance between sharpness and file size.</p>
                </div>
                <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">{quality}%</div>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                className="mt-4 w-full accent-indigo-500"
              />
            </div>
          ) : null}
          <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Resize output</p>
                <p className="mt-1 text-sm text-slate-600">Set exact dimensions before converting the final file.</p>
              </div>
              {metadata ? (
                <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
                  {metadata.width} x {metadata.height}
                </div>
              ) : null}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Width
                <input
                  type="number"
                  min={1}
                  className="field mt-2"
                  value={width || ""}
                  onChange={(event) => setWidth(Number(event.target.value))}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Height
                <input
                  type="number"
                  min={1}
                  className="field mt-2"
                  value={height || ""}
                  onChange={(event) => setHeight(Number(event.target.value))}
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Resize mode
              <select
                className="field mt-2"
                value={resizeMode}
                onChange={(event) => setResizeMode(event.target.value as ResizeMode)}
              >
                <option value="stretch">Stretch</option>
                <option value="fill">Fill</option>
                <option value="fit">Fit</option>
              </select>
            </label>
            <p className="mt-3 text-sm text-slate-600">
              {resizeMode === "stretch"
                ? "Stretch distorts the image to match the exact width and height."
                : resizeMode === "fill"
                  ? "Fill keeps the image ratio and crops overflow to cover the full frame."
                  : "Fit keeps the image ratio and fits everything inside the frame."}
            </p>
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
                <p className="font-medium">Converting image locally...</p>
              </div>
            ) : result && resultUrl && originalUrl ? (
              <>
                <PreviewCard
                  title="Converted output"
                  src={resultUrl}
                  alt="Converted output"
                  details={[
                    `${result.width} x ${result.height}`,
                    result.outputMimeType.replace("image/", "").toUpperCase(),
                    `Source ${fileStats?.original ?? "--"}`,
                    `Output ${fileStats?.converted ?? "--"}`,
                  ]}
                  fileSize={result.blob.size}
                  actionLabel={downloadLabel}
                  onAction={() => downloadBlob(result.blob, result.suggestedFileName)}
                />
                <div className="mt-6">
                  <ComparisonSlider beforeSrc={originalUrl} afterSrc={resultUrl} />
                </div>
              </>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-slate-600">
                <RefreshCcw className="size-7 text-indigo-500" />
                <p className="font-medium">Converted preview appears here automatically.</p>
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
              {downloadLabel}
            </button>
          ) : null}
        </div>
      </div>
    </ToolShell>
  );
}
