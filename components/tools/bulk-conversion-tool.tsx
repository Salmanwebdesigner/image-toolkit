"use client";

import JSZip from "jszip";
import { Archive, Download, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useNotifications } from "@/components/ui/notification-provider";
import { ToolShell } from "@/components/ui/tool-shell";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { downloadBlob } from "@/lib/download";
import {
  bulkConvertWithFallback,
  compressionPercentage,
  createOutputName,
  ensureImageFile,
  formatBytes,
  mimeTypeToExtension,
  qualityPercentToDecimal,
} from "@/lib/image-utils";
import type { BulkConversionResult, OutputMimeType } from "@/lib/types";

const mimeOptions: Array<{ label: string; value: OutputMimeType }> = [
  { label: "WebP", value: "image/webp" },
  { label: "PNG", value: "image/png" },
  { label: "JPG", value: "image/jpeg" },
  { label: "AVIF", value: "image/avif" },
];

interface BulkConversionPreviewResult extends BulkConversionResult {
  previewUrl: string;
  sourcePreviewUrl: string;
  sourceName: string;
  sourceMimeType: string;
}

export function BulkConversionTool() {
  const { notify } = useNotifications();
  const [files, setFiles] = useState<File[]>([]);
  const [sourcePreviewUrls, setSourcePreviewUrls] = useState<string[]>([]);
  const [targetMimeType, setTargetMimeType] = useState<OutputMimeType>("image/webp");
  const [quality, setQuality] = useState(82);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [results, setResults] = useState<BulkConversionPreviewResult[]>([]);

  const qualityEnabled = targetMimeType !== "image/png";

  const sourcePreviewUrlsRef = useRef<string[]>([]);
  const resultPreviewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    sourcePreviewUrlsRef.current = sourcePreviewUrls;
  }, [sourcePreviewUrls]);

  useEffect(() => {
    resultPreviewUrlsRef.current = results.map((item) => item.previewUrl);
  }, [results]);

  useEffect(() => {
    return () => {
      sourcePreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      resultPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const totals = useMemo(() => {
    if (results.length === 0) {
      return null;
    }

    const source = results.reduce((sum, item) => sum + item.sourceSize, 0);
    const output = results.reduce((sum, item) => sum + item.outputSize, 0);

    return { source, output };
  }, [results]);

  function resetResults() {
    setResults((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }

  function resetSourcePreviews() {
    setSourcePreviewUrls((current) => {
      current.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
  }

  function ensureSourcePreviewsForFiles(queue: File[]) {
    if (sourcePreviewUrls.length === queue.length && sourcePreviewUrls.every(Boolean)) {
      return sourcePreviewUrls;
    }

    resetSourcePreviews();
    const nextUrls = queue.map((file) => URL.createObjectURL(file));
    setSourcePreviewUrls(nextUrls);
    return nextUrls;
  }

  function handleFilesSelected(nextFiles: File[]) {
    try {
      nextFiles.forEach(ensureImageFile);
      setFiles(nextFiles);
      resetResults();
      setProgress("");
      resetSourcePreviews();
      setSourcePreviewUrls(nextFiles.map((file) => URL.createObjectURL(file)));
      notify("success", `${nextFiles.length} image${nextFiles.length === 1 ? "" : "s"} queued for bulk conversion.`);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not load the selected images.");
    }
  }

  async function convertWithWorker(queue: File[], queuePreviewUrls: string[]) {
    return await new Promise<BulkConversionPreviewResult[]>((resolve, reject) => {
      const worker = new Worker("/workers/image-worker.js");

      worker.onmessage = (event: MessageEvent) => {
        const payload = event.data as
          | { type: "progress"; completed: number; total: number }
          | { type: "done"; results: Array<{ name: string; buffer: ArrayBuffer; size: number }> }
          | { type: "error"; message: string };

        if (payload.type === "progress") {
          setProgress(`Converted ${payload.completed} of ${payload.total} images...`);
          return;
        }

        if (payload.type === "error") {
          worker.terminate();
          reject(new Error(payload.message));
          return;
        }

        if (payload.type === "done") {
          const converted = payload.results.map((item, index) => {
            const source = queue[index];
            const blob = new Blob([item.buffer], { type: targetMimeType });

            return {
              name: createOutputName(source?.name ?? item.name, targetMimeType, "converted"),
              blob,
              mimeType: targetMimeType,
              sourceSize: source?.size ?? 0,
              outputSize: item.size,
              previewUrl: URL.createObjectURL(blob),
              sourcePreviewUrl: queuePreviewUrls[index] ?? "",
              sourceName: source?.name ?? item.name,
              sourceMimeType: source?.type ?? "image/unknown",
            };
          });
          worker.terminate();
          resolve(converted);
        }
      };

      worker.onerror = () => {
        worker.terminate();
        reject(new Error("Worker-based conversion failed."));
      };

      worker.postMessage({
        files: queue,
        targetMimeType,
        quality: qualityPercentToDecimal(quality),
      });
    });
  }

  async function handleBulkConvert() {
    if (files.length === 0) {
      notify("error", "Select multiple images first.");
      return;
    }

    try {
      setLoading(true);
      setProgress("Starting local conversion...");
      resetResults();
      const previewUrls = ensureSourcePreviewsForFiles(files);

      let converted: BulkConversionPreviewResult[];

      try {
        converted = await convertWithWorker(files, previewUrls);
      } catch {
        setProgress("Falling back to main-thread conversion...");
        const fallback = await bulkConvertWithFallback(files, targetMimeType, qualityPercentToDecimal(quality));
        converted = fallback.map((item, index) => {
          const source = files[index];
          return {
            ...item,
            previewUrl: URL.createObjectURL(item.blob),
            sourcePreviewUrl: previewUrls[index] ?? "",
            sourceName: source?.name ?? item.name,
            sourceMimeType: source?.type ?? "image/unknown",
          };
        });
      }

      setResults(converted);
      setProgress(`Ready. ${converted.length} files converted to ${mimeTypeToExtension(targetMimeType).toUpperCase()}.`);
      notify("success", "Bulk conversion results are ready.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Bulk conversion failed.");
      setProgress("");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadAllAsZip() {
    if (results.length === 0) {
      notify("error", "Convert the batch first.");
      return;
    }

    try {
      setLoading(true);
      setProgress("Packaging ZIP archive...");
      const zip = new JSZip();
      results.forEach((item) => {
        zip.file(item.name, item.blob);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `image-toolkit-bulk-${mimeTypeToExtension(targetMimeType)}.zip`);
      setProgress(`Downloaded ZIP with ${results.length} converted file${results.length === 1 ? "" : "s"}.`);
      notify("success", "Bulk ZIP download is ready.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not create the ZIP download.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolShell
      id="bulk"
      eyebrow="Bulk Conversion"
      title="Convert multiple images and export everything as ZIP"
      description="Convert a batch locally, review each result, download files individually, or export everything together as ZIP."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <UploadDropzone
            label="Upload multiple images for bulk conversion"
            helperText="Batch processing uses Web Workers when available and falls back to main-thread conversion when needed."
            multiple
            onFilesSelected={handleFilesSelected}
          />
          <div className="glass-card p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Target format
                <select
                  className="field mt-2"
                  value={targetMimeType}
                  onChange={(event) => setTargetMimeType(event.target.value as OutputMimeType)}
                >
                  {mimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Quality
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  disabled={!qualityEnabled}
                  onChange={(event) => setQuality(Number(event.target.value))}
                  className="mt-5 w-full accent-indigo-500 disabled:opacity-40"
                />
                <span className="mt-2 block text-sm text-slate-600">{qualityEnabled ? `${quality}%` : "Lossless PNG output"}</span>
              </label>
            </div>
            <button type="button" className="button-primary mt-5 w-full" onClick={handleBulkConvert} disabled={loading}>
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Archive className="size-4" />}
              Convert all
            </button>
          </div>
        </div>
        <div className="glass-card p-5">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center text-slate-600">
              <LoaderCircle className="size-8 animate-spin text-indigo-500" />
              <p className="font-medium">{progress || "Converting..."}</p>
            </div>
          ) : files.length > 0 ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {results.length > 0 ? "Bulk conversion results" : "Bulk queue"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {results.length > 0
                      ? `${results.length} converted file${results.length === 1 ? "" : "s"} ready`
                      : `${files.length} files selected for conversion`}
                  </p>
                </div>
                {results.length > 0 ? (
                  <button type="button" className="button-secondary" onClick={handleBulkConvert} disabled={loading}>
                    <Download className="size-4" />
                    Reconvert all
                  </button>
                ) : null}
              </div>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((item) => (
                    <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
                      <div className="grid gap-4 sm:grid-cols-[128px_1fr] sm:items-start">
                        <div className="overflow-hidden rounded-2xl bg-white">
                          <img src={item.previewUrl} alt={item.name} className="h-24 w-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">{item.sourceName}</p>
                              <p className="mt-1 text-sm text-slate-600">
                                {item.sourceMimeType.replace("image/", "").toUpperCase()} →{" "}
                                {item.mimeType.replace("image/", "").toUpperCase()}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="button-secondary shrink-0"
                              onClick={() => downloadBlob(item.blob, item.name)}
                            >
                              <Download className="size-4" />
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
                              Saved:{" "}
                              <span className="font-medium text-emerald-600">
                                {compressionPercentage(item.sourceSize, item.outputSize).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={`${file.name}-${file.lastModified}`} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{file.name}</p>
                          <p className="mt-1 text-sm text-slate-600">{formatBytes(file.size)}</p>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          {file.type.replace("image/", "").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {totals ? (
                <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-semibold">Conversion summary</p>
                  <p className="mt-1">Source total: {formatBytes(totals.source)}</p>
                  <p className="mt-1">Converted total: {formatBytes(totals.output)}</p>
                  <p className="mt-2">{progress}</p>
                </div>
              ) : progress ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{progress}</div>
              ) : null}
              {results.length > 0 ? (
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
              Upload multiple files to generate a ZIP archive of converted images.
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
