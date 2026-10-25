async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    // Respeita a orientação da foto tirada pelo celular.
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Reduz a foto para no máximo `maxSize` px e converte para WebP (ou JPEG em navegadores antigos). */
export async function compressImage(file: File, maxSize = 1200): Promise<Blob> {
  const source = await decode(file);
  const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas indisponível");
  context.drawImage(source, 0, 0, width, height);
  if ("close" in source) source.close();

  const webp = await toBlob(canvas, "image/webp", 0.82);
  if (webp?.type === "image/webp") return webp;

  const jpeg = await toBlob(canvas, "image/jpeg", 0.85);
  if (!jpeg) throw new Error("falha ao converter imagem");
  return jpeg;
}
