self.onmessage = async (event) => {
  const { files, targetMimeType, quality } = event.data;

  if (typeof createImageBitmap === "undefined" || typeof OffscreenCanvas === "undefined") {
    self.postMessage({
      type: "error",
      message: "Worker-based conversion is not supported in this browser.",
    });
    return;
  }

  try {
    const results = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const bitmap = await createImageBitmap(file);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not render a file inside the worker.");
      }

      if (targetMimeType === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(bitmap, 0, 0);
      const blob = await canvas.convertToBlob({ type: targetMimeType, quality });
      const buffer = await blob.arrayBuffer();

      results.push({
        name: file.name,
        buffer,
        size: blob.size,
      });

      self.postMessage({
        type: "progress",
        completed: index + 1,
        total: files.length,
      });
    }

    self.postMessage(
      {
        type: "done",
        results,
      },
      results.map((item) => item.buffer),
    );
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Worker conversion failed.",
    });
  }
};
