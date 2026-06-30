"use client";

import { ImagePlus, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

interface UploadDropzoneProps {
  label: string;
  helperText: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
}

export function UploadDropzone({
  label,
  helperText,
  accept = "image/*",
  multiple = false,
  onFilesSelected,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function sendFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        sendFiles(event.dataTransfer.files);
      }}
      className={`glass-card flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition ${
        isDragging ? "border-indigo-400 bg-indigo-50/70 shadow-float" : "border-slate-200"
      }`}
      aria-label={label}
    >
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 p-4 text-white shadow-float">
        {multiple ? <UploadCloud className="size-6" /> : <ImagePlus className="size-6" />}
      </div>
      <p className="text-lg font-semibold text-slate-900">{label}</p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{helperText}</p>
      <button type="button" className="button-secondary mt-5">
        Choose {multiple ? "images" : "image"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => sendFiles(event.target.files)}
      />
    </div>
  );
}
