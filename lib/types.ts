export type OutputMimeType = "image/jpeg" | "image/png" | "image/webp" | "image/avif";
export type ResizeMode = "stretch" | "fill" | "fit";

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  mimeType: string;
  lastModified: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessImageOptions {
  file: File | Blob;
  mimeType: OutputMimeType;
  quality?: number;
  width?: number;
  height?: number;
  resizeMode?: ResizeMode;
  crop?: CropArea;
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  backgroundColor?: string;
  fileName?: string;
}

export interface ProcessedImageResult {
  blob: Blob;
  width: number;
  height: number;
  outputMimeType: OutputMimeType;
  suggestedFileName: string;
}

export interface PresetSize {
  label: string;
  width: number;
  height: number;
}

export interface BulkConversionResult {
  name: string;
  blob: Blob;
  mimeType: OutputMimeType;
  sourceSize: number;
  outputSize: number;
}
