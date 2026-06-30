import type {
  BulkConversionResult,
  ImageMetadata,
  OutputMimeType,
  ProcessImageOptions,
  ProcessedImageResult,
  ResizeMode,
} from "@/lib/types";

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export function fileNameWithoutExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? fileName : fileName.slice(0, lastDot);
}

export function mimeTypeToExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "img";
  }
}

export function createOutputName(fileName: string, mimeType: string, suffix?: string) {
  const base = fileNameWithoutExtension(fileName);
  const ext = mimeTypeToExtension(mimeType);
  return `${base}${suffix ? `-${suffix}` : ""}.${ext}`;
}

export function qualityPercentToDecimal(value: number) {
  return Math.min(1, Math.max(0.01, value / 100));
}

export function compressionPercentage(originalSize: number, newSize: number) {
  if (!originalSize) {
    return 0;
  }

  return Math.max(0, ((originalSize - newSize) / originalSize) * 100);
}

export function ensureImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Files larger than 50MB are not supported.");
  }
}

export async function isMimeTypeSupported(mimeType: OutputMimeType) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL(mimeType).startsWith(`data:${mimeType}`);
}

export async function loadImageFromBlob(file: File | Blob) {
  const url = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unable to decode the selected image."));
      img.src = url;
    });

    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function getImageMetadata(file: File): Promise<ImageMetadata> {
  ensureImageFile(file);
  const image = await loadImageFromBlob(file);

  return {
    fileName: file.name,
    fileSize: file.size,
    width: image.naturalWidth,
    height: image.naturalHeight,
    mimeType: file.type || "image/unknown",
    lastModified: file.lastModified,
  };
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

async function canvasToBlob(canvas: HTMLCanvasElement, mimeType: OutputMimeType, quality?: number) {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });

  if (!blob) {
    throw new Error(`This browser could not export ${mimeType.toUpperCase().replace("IMAGE/", "")}.`);
  }

  return blob;
}

function normalizedAngle(angle: number) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function resolveDrawSize(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  resizeMode: ResizeMode,
) {
  if (resizeMode === "stretch") {
    return {
      drawWidth: targetWidth,
      drawHeight: targetHeight,
    };
  }

  const scale =
    resizeMode === "fill"
      ? Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
      : Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);

  return {
    drawWidth: Math.max(1, Math.round(sourceWidth * scale)),
    drawHeight: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

export async function processImage(options: ProcessImageOptions): Promise<ProcessedImageResult> {
  const image = await loadImageFromBlob(options.file);
  const rotation = normalizedAngle(options.rotation ?? 0);
  const resizeMode = options.resizeMode ?? "stretch";
  const selection = options.crop ?? {
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };

  const renderWidth = Math.max(1, Math.round(options.width ?? selection.width));
  const renderHeight = Math.max(1, Math.round(options.height ?? selection.height));
  const { drawWidth, drawHeight } = resolveDrawSize(
    selection.width,
    selection.height,
    renderWidth,
    renderHeight,
    resizeMode,
  );
  const quarterTurn = rotation === 90 || rotation === 270;
  const canvasWidth = quarterTurn ? renderHeight : renderWidth;
  const canvasHeight = quarterTurn ? renderWidth : renderHeight;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser does not support canvas rendering.");
  }

  if (options.backgroundColor) {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((rotation * Math.PI) / 180);
  context.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
  context.drawImage(
    image,
    selection.x,
    selection.y,
    selection.width,
    selection.height,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight,
  );
  context.restore();

  const blob = await canvasToBlob(canvas, options.mimeType, options.quality);

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    outputMimeType: options.mimeType,
    suggestedFileName: createOutputName(options.fileName ?? "image", options.mimeType),
  };
}

export function smartCompressionFormat(sourceType: string): OutputMimeType {
  if (sourceType === "image/jpeg" || sourceType === "image/webp" || sourceType === "image/avif") {
    return sourceType as OutputMimeType;
  }

  return "image/webp";
}

export async function createPreviewUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}

export function revokePreviewUrl(url?: string | null) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

export async function bulkConvertWithFallback(
  files: File[],
  targetMimeType: OutputMimeType,
  quality: number,
): Promise<BulkConversionResult[]> {
  const results: BulkConversionResult[] = [];

  for (const file of files) {
    const processed = await processImage({
      file,
      mimeType: targetMimeType,
      quality,
      backgroundColor: targetMimeType === "image/jpeg" ? "#ffffff" : undefined,
      fileName: file.name,
    });

    results.push({
      name: createOutputName(file.name, targetMimeType, "converted"),
      blob: processed.blob,
      mimeType: processed.outputMimeType,
      sourceSize: file.size,
      outputSize: processed.blob.size,
    });
  }

  return results;
}
