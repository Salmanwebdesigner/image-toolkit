"use client";

import { FileImage } from "lucide-react";
import { useEffect, useState } from "react";

import { useNotifications } from "@/components/ui/notification-provider";
import { ToolShell } from "@/components/ui/tool-shell";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { formatBytes, getImageMetadata } from "@/lib/image-utils";
import type { ImageMetadata } from "@/lib/types";

export function MetadataViewerTool() {
  const { notify } = useNotifications();
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFilesSelected(files: File[]) {
    try {
      const nextFile = files[0];
      const nextMetadata = await getImageMetadata(nextFile);
      setMetadata(nextMetadata);
      setPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return URL.createObjectURL(nextFile);
      });
      notify("success", "Metadata extracted locally.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Could not inspect the image.");
    }
  }

  return (
    <ToolShell
      id="metadata"
      eyebrow="Metadata"
      title="Inspect image metadata instantly"
      description="View file name, file size, resolution, MIME type, and last modified date without uploading the image anywhere."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <UploadDropzone
          label="Drop an image to inspect metadata"
          helperText="Metadata extraction is local and private, using browser decoding only."
          onFilesSelected={handleFilesSelected}
        />
        <div className="glass-card p-5">
          {metadata ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">File name</p>
                <p className="mt-2 font-semibold text-slate-900">{metadata.fileName}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">File size</p>
                <p className="mt-2 font-semibold text-slate-900">{formatBytes(metadata.fileSize)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Resolution</p>
                <p className="mt-2 font-semibold text-slate-900">
                  {metadata.width} x {metadata.height}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">MIME type</p>
                <p className="mt-2 font-semibold text-slate-900">{metadata.mimeType}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last modified</p>
                <p className="mt-2 font-semibold text-slate-900">{new Date(metadata.lastModified).toLocaleString()}</p>
              </div>
              {previewUrl ? (
                <div className="overflow-hidden rounded-2xl bg-slate-100 sm:col-span-2">
                  <img src={previewUrl} alt={metadata.fileName} className="aspect-[16/9] w-full object-contain" />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center text-slate-600">
              <FileImage className="size-7 text-indigo-500" />
              <p className="font-medium">Metadata details appear here after selecting an image.</p>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
