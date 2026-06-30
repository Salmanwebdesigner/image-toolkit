import { Download } from "lucide-react";

import { formatBytes } from "@/lib/image-utils";

interface PreviewCardProps {
  title: string;
  src: string;
  alt: string;
  details: string[];
  fileSize?: number;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function PreviewCard({
  title,
  src,
  alt,
  details,
  fileSize,
  actionLabel = "Download",
  onAction,
  className = "",
}: PreviewCardProps) {
  return (
    <div className={`glass-card overflow-hidden p-4 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {details.map((detail) => (
              <span key={detail} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {detail}
              </span>
            ))}
            {typeof fileSize === "number" ? (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                {formatBytes(fileSize)}
              </span>
            ) : null}
          </div>
        </div>
        {onAction ? (
          <button type="button" className="button-secondary shrink-0" onClick={onAction}>
            <Download className="size-4" />
            {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-2xl bg-slate-100">
        <img src={src} alt={alt} className="aspect-[4/3] h-full w-full object-contain" />
      </div>
    </div>
  );
}
