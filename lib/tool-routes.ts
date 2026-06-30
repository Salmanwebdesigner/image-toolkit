export interface ToolRoute {
  href: string;
  title: string;
  description: string;
  eyebrow: string;
}

export const toolRoutes: ToolRoute[] = [
  {
    href: "/compress",
    title: "Compress",
    description: "Reduce image size with quality control and live savings stats.",
    eyebrow: "Compression",
  },
  {
    href: "/convert/webp",
    title: "To WebP",
    description: "Convert JPG, JPEG, and PNG images to WebP locally.",
    eyebrow: "Convert",
  },
  {
    href: "/convert/png",
    title: "To PNG",
    description: "Convert JPG and WebP files to PNG without uploading on server.",
    eyebrow: "Convert",
  },
  {
    href: "/convert/jpg",
    title: "To JPG",
    description: "Flatten transparency onto white and export to JPG.",
    eyebrow: "Convert",
  },
  {
    href: "/convert/avif",
    title: "To AVIF",
    description: "Create modern AVIF files in supported browsers.",
    eyebrow: "Convert",
  },
  {
    href: "/bulk",
    title: "Bulk Conversion",
    description: "Convert batches of images and export them together as ZIP.",
    eyebrow: "Bulk",
  },
  {
    href: "/resize",
    title: "Resize",
    description: "Resize with exact dimensions and social media presets.",
    eyebrow: "Resize",
  },
  {
    href: "/crop",
    title: "Crop",
    description: "Use an interactive cropper with freeform and aspect presets.",
    eyebrow: "Crop",
  },
  {
    href: "/rotate",
    title: "Rotate & Flip",
    description: "Rotate left or right and mirror horizontally or vertically.",
    eyebrow: "Edit",
  },
  {
    href: "/metadata",
    title: "Metadata",
    description: "Inspect file size, dimensions, mime type, and modified date.",
    eyebrow: "Inspect",
  },
];
