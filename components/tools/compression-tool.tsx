"use client";

import JSZip from "jszip";
import { Archive, Download, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ComparisonSlider } from "@/components/ui/comparison-slider";
import { useNotifications } from "@/components/ui/notification-provider";
import { PreviewCard } from "@/components/ui/preview-card";
import { ToolShell } from "@/components/ui/tool-shell";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { downloadBlob } from "@/lib/download";
import {
  compressionPercentage,
  createOutputName,
  ensureImageFile,
  formatBytes,
  getImageMetadata,
  isMimeTypeSupported,
  processImage,
  qualityPercentToDecimal,
  smartCompressionFormat,
} from "@/lib/image-utils";
import type { BulkConversionResult, ImageMetadata, ProcessedImageResult } from "@/lib/types";

const BULK_COMPRESSION_MAX_FILES = 10;
const BULK_COMPRESSION_MAX_TOTAL_SIZE = 100 * 1024 * 1024;

type CompressionMode = "single" | "bulk";

interface BulkCompressionPreviewResult extends BulkConversionResult {
  previewUrl: string;
  width: number;
  height: number;
}

export function CompressionTool() {
  const { notify } = useNotifications();
  const [mode, setMode] = useState<CompressionMode>("single");
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkResults, setBulkResults] = useState<BulkCompressionPreviewResult[]>([]);
  const [quality, setQuality] = useState(82);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

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
    return () => {
      bulkResults.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [bulkResults]);

  useEffect(() => {
    if (mode !== "single" || !file) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const outputMimeType = smartCompressionFormat(file.type);
        const supported = await isMimeTypeSupported(outputMimeType);

        if (!supported) {
          throw new Error(`This browser cannot export ${outputMimeType.replace("image/", "").toUpperCase()}.`);
        }

        const processed = await processImage({
          file,
          mimeType: outputMimeType,
          quality: qualityPercentToDecimal(quality),
          backgroundColor: outputMimeType === "image/jpeg" ? "#ffffff" : undefined,
          fileName: file.name,
        });

        if (cancelled) {
          return;
        }

        setResult((current) => {
          if (current?.blob) {
            // no-op state barrier for URL cleanup below
          }
          return processed;
        });

        setResultUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
          }
          return URL.createObjectURL(processed.blob);
        });
      } catch (error) {
        if (!cancelled) {
          notify("error", error instanceof Error ? error.message : "Compression failed.");
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
  }, [file, mode, notify, quality]);

  const compressionStats = useMemo(() => {
    if (!file || !result) {
      return null;
    }

    return {
      original: formatBytes(file.size),
      compressed: formatBytes(result.blob.size),
      saved: `${compressionPercentage(file.size, result.blob.size).toFixed(1)}%`,
    };
  }, [file, result]);

  const bulkSelectionStats = useMemo(() => {
    if (bulkFiles.length === 0) {
      return null;
    }

    return {
      count: bulkFiles.length,
      totalSize: bulkFiles.reduce((sum, item) => sum + item.size, 0),
    };
  }, [bulkFiles]);

  const bulkCompressionStats = useMemo(() => {
    if (bulkResults.length === 0) {
      return null;
    }

    const original = bulkResults.reduce((sum, item) => sum + item.sourceSize, 0);
    const compressed = bulkResults.reduce((sum, item) => sum + item.outputSize, 0);

    return {
      original: formatBytes(original),
      compressed: formatBytes(compressed),
      saved: `${compressionPercentage(original, compressed).toFixed(1)}%`,
    };
  }, [bulkResults]);

  function resetBulkResults() {
    setBulkResults((current) => {
      current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
  }

  function resetSingleState() {
    setFile(null);
    setMetadata(null);
    setResult(null);
    setOriginalUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
    setResultUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
  }

  function resetBulkState() {
    setBulkFiles([]);
    resetBulkResults();
    setProgress("");
  }

  function validateBulkCompressionBatch(files: File[]) {
    if (files.length > BULK_COMPRESSION_MAX_FILES) {
      throw new Error(`Bulk compression is limited to ${BULK_COMPRESSION_MAX_FILES} images per batch.`);
    }

    const totalSize = files.reduce((sum, item) => sum + item.size, 0);
    if (totalSize > BULK_COMPRESSION_MAX_TOTAL_SIZE) {
      throw new Error(
        `Bulk compression is limited to ${formatBytes(BULK_COMPRESSION_MAX_TOTAL_SIZE)} total per batch.`,
      );
    }
  }

  async function handleFilesSelected(files: File[]) {
    try {
      if (mode === "bulk") {
        files.forEach(ensureImageFile);
        validateBulkCompressionBatch(files);
        resetSingleState();
        setBulkFiles(files);
        resetBulkResults();
        setProgress("");
        notify("success", `${files.length} image${files.length === 1 ? "" : "s"} ready for bulk compression.`);
        return;
      }

      const nextFile = files[0];
      ensureImageFile(nextFile);
      const nextMetadata = await getImageMetadata(nextFile);
      resetBulkState();
      setFile(nextFile);
      setMetadata(nextMetadata);
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
      notify("success", "Image ready for compression.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not load the image.");
    }
  }

  async function handleBulkCompress() {
    if (bulkFiles.length === 0) {
      notify("error", "Select images for bulk compression first.");
      return;
    }

    try {
      setLoading(true);
      setProgress("Starting local batch compression...");

      const supportCache = new Map<string, boolean>();
      const compressed: BulkCompressionPreviewResult[] = [];
      resetBulkResults();

      for (let index = 0; index < bulkFiles.length; index += 1) {
        const currentFile = bulkFiles[index];
        const outputMimeType = smartCompressionFormat(currentFile.type);

        if (!supportCache.has(outputMimeType)) {
          supportCache.set(outputMimeType, await isMimeTypeSupported(outputMimeType));
        }

        if (!supportCache.get(outputMimeType)) {
          throw new Error(`This browser cannot export ${outputMimeType.replace("image/", "").toUpperCase()}.`);
        }

        const processed = await processImage({
          file: currentFile,
          mimeType: outputMimeType,
          quality: qualityPercentToDecimal(quality),
          backgroundColor: outputMimeType === "image/jpeg" ? "#ffffff" : undefined,
          fileName: currentFile.name,
        });

        compressed.push({
          name: createOutputName(currentFile.name, outputMimeType, "compressed"),
          blob: processed.blob,
          mimeType: processed.outputMimeType,
          sourceSize: currentFile.size,
          outputSize: processed.blob.size,
          previewUrl: URL.createObjectURL(processed.blob),
          width: processed.width,
          height: processed.height,
        });

        setProgress(`Compressed ${index + 1} of ${bulkFiles.length} images...`);
      }

      setBulkResults(compressed);
      setProgress(`Ready. ${compressed.length} image${compressed.length === 1 ? "" : "s"} compressed locally.`);
      notify("success", "Bulk compression results are ready.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Bulk compression failed.");
      setProgress("");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadAllAsZip() {
    if (bulkResults.length === 0) {
      notify("error", "Compress the batch first.");
      return;
    }

    try {
      setLoading(true);
      setProgress("Packaging ZIP archive...");
      const zip = new JSZip();
      bulkResults.forEach((item) => {
        zip.file(item.name, item.blob);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "image-toolkit-bulk-compression.zip");
      setProgress(`Downloaded ZIP with ${bulkResults.length} compressed image${bulkResults.length === 1 ? "" : "s"}.`);
      notify("success", "Bulk ZIP download is ready.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not create the ZIP download.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      id="compression"
      eyebrow="Compression"
      title="Compress images without leaving the browser"
      description="Compress one image with live preview or review a guarded bulk batch before downloading files individually or as one ZIP."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="glass-card p-5">
            <p className="text-sm font-medium text-slate-900">Compression mode</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className={mode === "single" ? "button-primary" : "button-secondary"}
                onClick={() => setMode("single")}
                disabled={loading}
              >
                Single image
              </button>
              <button
                type="button"
                className={mode === "bulk" ? "button-primary" : "button-secondary"}
                onClick={() => setMode("bulk")}
                disabled={loading}
              >
                Bulk compression
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {mode === "single"
                ? "Use the live preview workflow for one image at a time."
                : `Bulk mode is limited to ${BULK_COMPRESSION_MAX_FILES} images or ${formatBytes(BULK_COMPRESSION_MAX_TOTAL_SIZE)} total per batch.`}
            </p>
          </div>
          <UploadDropzone
            label={
              mode === "single"
                ? "Drag, drop, or click to compress an image"
                : "Drag, drop, or click to compress a batch of images"
            }
            helperText={
              mode === "single"
                ? "Compression runs locally using Canvas APIs only. Files never leave the device."
                : `Bulk compression runs locally so you can review results first, then download files individually or as ZIP. Limit ${BULK_COMPRESSION_MAX_FILES} images or ${formatBytes(BULK_COMPRESSION_MAX_TOTAL_SIZE)} total.`
            }
            multiple={mode === "bulk"}
            onFilesSelected={handleFilesSelected}
          />
          <div className="glass-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Quality</p>
                <p className="mt-1 text-sm text-slate-600">
                  Lower values reduce file size more aggressively in both single and bulk modes.
                </p>
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
            {mode === "single" ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Original size</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{compressionStats?.original ?? "--"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Compressed size</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{compressionStats?.compressed ?? "--"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Saved</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-600">{compressionStats?.saved ?? "--"}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{bulkSelectionStats?.count ?? 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Batch total</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {bulkSelectionStats ? formatBytes(bulkSelectionStats.totalSize) : "--"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Batch saved</p>
                    <p className="mt-2 text-lg font-semibold text-emerald-600">{bulkCompressionStats?.saved ?? "--"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="button-primary mt-5 w-full"
                  onClick={handleBulkCompress}
                  disabled={loading || bulkFiles.length === 0}
                >
                  {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Archive className="size-4" />}
                  Compress all
                </button>
              </>
            )}
          </div>
          {mode === "single" && metadata && originalUrl ? (
            <PreviewCard
              title="Original image"
              src={originalUrl}
              alt={metadata.fileName}
              details={[`${metadata.width} x ${metadata.height}`, metadata.mimeType.replace("image/", "").toUpperCase()]}
              fileSize={metadata.fileSize}
            />
          ) : null}
        </div>
        <div className="space-y-6">
          {mode === "single" ? (
            <>
              <div className="glass-card flex min-h-[280px] flex-col justify-center p-5">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-slate-600">
                    <LoaderCircle className="size-7 animate-spin text-indigo-500" />
                    <p className="font-medium">Processing your image locally...</p>
                  </div>
                ) : result && resultUrl && metadata && originalUrl ? (
                  <>
                    <PreviewCard
                      title="Compressed output"
                      src={resultUrl}
                      alt="Compressed output"
                      details={[
                        `${result.width} x ${result.height}`,
                        result.outputMimeType.replace("image/", "").toUpperCase(),
                      ]}
                      fileSize={result.blob.size}
                      actionLabel="Download compressed file"
                      onAction={() => downloadBlob(result.blob, result.suggestedFileName)}
                    />
                    <div className="mt-6">
                      <ComparisonSlider beforeSrc={originalUrl} afterSrc={resultUrl} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-slate-600">
                    <Sparkles className="size-7 text-indigo-500" />
                    <p className="font-medium">Compressed output appears here automatically.</p>
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
                  Download compressed image
                </button>
              ) : null}
            </>
          ) : (
            <div className="glass-card p-5">
              {loading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center text-slate-600">
                  <LoaderCircle className="size-8 animate-spin text-indigo-500" />
                  <p className="font-medium">{progress || "Compressing images..."}</p>
                </div>
              ) : bulkFiles.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {bulkResults.length > 0 ? "Bulk compression results" : "Bulk compression queue"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {bulkResults.length > 0
                          ? `${bulkResults.length} compressed image${bulkResults.length === 1 ? "" : "s"} ready`
                          : `${bulkFiles.length} files selected for local compression`}
                      </p>
                    </div>
                    {bulkResults.length > 0 ? (
                      <button type="button" className="button-secondary" onClick={handleBulkCompress} disabled={loading}>
                        <Download className="size-4" />
                        Recompress all
                      </button>
                    ) : null}
                  </div>
                  {bulkResults.length > 0 ? (
                    <div className="space-y-3">
                      {bulkResults.map((item, index) => {
                        const sourceFile = bulkFiles[index];
                        const saved = compressionPercentage(item.sourceSize, item.outputSize).toFixed(1);

                        return (
                          <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
                            <div className="grid gap-4 sm:grid-cols-[128px_1fr] sm:items-start">
                              <div className="overflow-hidden rounded-2xl bg-white">
                                <img
                                  src={item.previewUrl}
                                  alt={item.name}
                                  className="h-24 w-full object-contain"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-slate-900">{sourceFile?.name ?? item.name}</p>
                                    <p className="mt-1 text-sm text-slate-600">
                                      {item.width} x {item.height} • {item.mimeType.replace("image/", "").toUpperCase()}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    className="button-secondary shrink-0"
                                    onClick={() => downloadBlob(item.blob, item.name)}
                                  >
                                    <Download className="size-4" />
                                    Download
                                  </button>
                                </div>
                                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                                  <div className="rounded-xl bg-white px-3 py-2">
                                    Before: <span className="font-medium text-slate-900">{formatBytes(item.sourceSize)}</span>
                                  </div>
                                  <div className="rounded-xl bg-white px-3 py-2">
                                    After: <span className="font-medium text-slate-900">{formatBytes(item.outputSize)}</span>
                                  </div>
                                  <div className="rounded-xl bg-white px-3 py-2">
                                    Saved: <span className="font-medium text-emerald-600">{saved}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bulkFiles.map((item) => (
                        <div key={`${item.name}-${item.lastModified}`} className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">{item.name}</p>
                              <p className="mt-1 text-sm text-slate-600">{formatBytes(item.size)}</p>
                            </div>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                              {item.type.replace("image/", "").toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {bulkCompressionStats ? (
                    <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                      <p className="font-semibold">Compression summary</p>
                      <p className="mt-1">Original total: {bulkCompressionStats.original}</p>
                      <p className="mt-1">Compressed total: {bulkCompressionStats.compressed}</p>
                      <p className="mt-1">Saved: {bulkCompressionStats.saved}</p>
                      <p className="mt-2">{progress}</p>
                    </div>
                  ) : progress ? (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{progress}</div>
                  ) : null}
                  {bulkResults.length > 0 ? (
                    <button
                      type="button"
                      className="button-primary mt-5 w-full"
                      onClick={handleDownloadAllAsZip}
                      disabled={loading}
                    >
                      {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Archive className="size-4" />}
                      Download all as ZIP
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[300px] items-center justify-center text-center text-slate-600">
                  Select a browser-safe batch to compress multiple images into one ZIP download.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
