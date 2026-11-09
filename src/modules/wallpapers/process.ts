/** Downscale an image file to a JPEG data URL suitable for chrome.storage.local. */
export async function fileToDataUrl(file: File, maxDim = 1920): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Image is larger than 20 MB.');
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error('Could not read that image. Try a JPEG, PNG or WebP file.');
  }
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  for (const q of [0.85, 0.7, 0.55]) {
    const url = canvas.toDataURL('image/jpeg', q);
    if (url.length <= 2_500_000) return url;
  }
  throw new Error('Image is too large even after compression. Choose a smaller one.');
}

/** Load a bundled image (extension URL, no network) and return it as a JPEG data URL. */
export function imageUrlToDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      resolve(c.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => reject(new Error('Could not load the built-in wallpaper.'));
    img.src = src;
  });
}
