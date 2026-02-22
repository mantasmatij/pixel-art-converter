import { Color } from "./paletteParser";

/** Minimum average alpha for a block to be rendered (fully transparent blocks are skipped) */
const TRANSPARENCY_THRESHOLD = 10;

/** Find the nearest color in a palette to a given RGB color using squared Euclidean distance */
export function nearestColor(r: number, g: number, b: number, palette: Color[]): Color {
  let best = palette[0];
  let bestDist = Infinity;

  for (const color of palette) {
    const dr = r - color.r;
    const dg = g - color.g;
    const db = b - color.b;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = color;
    }
  }

  return best;
}

/**
 * Convert an image to pixel art on a canvas.
 * @param sourceCanvas - The source canvas with the original image drawn onto it
 * @param outputCanvas - The destination canvas to draw the pixel art onto
 * @param pixelSize - Size of each "pixel block" in pixels
 * @param palette - Optional color palette to quantize colors to
 */
export function convertToPixelArt(
  sourceCanvas: HTMLCanvasElement,
  outputCanvas: HTMLCanvasElement,
  pixelSize: number,
  palette: Color[] | null
): void {
  const ctx = sourceCanvas.getContext("2d");
  if (!ctx) return;

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  outputCanvas.width = width;
  outputCanvas.height = height;

  const outCtx = outputCanvas.getContext("2d");
  if (!outCtx) return;

  outCtx.clearRect(0, 0, width, height);

  const cols = Math.ceil(width / pixelSize);
  const rows = Math.ceil(height / pixelSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * pixelSize;
      const y = row * pixelSize;
      const blockW = Math.min(pixelSize, width - x);
      const blockH = Math.min(pixelSize, height - y);

      // Get all pixels in this block
      const imageData = ctx.getImageData(x, y, blockW, blockH);
      const data = imageData.data;

      let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
      const pixelCount = blockW * blockH;

      for (let i = 0; i < data.length; i += 4) {
        totalR += data[i];
        totalG += data[i + 1];
        totalB += data[i + 2];
        totalA += data[i + 3];
      }

      const avgA = totalA / pixelCount;
      if (avgA < TRANSPARENCY_THRESHOLD) continue; // Skip nearly transparent blocks

      let r = Math.round(totalR / pixelCount);
      let g = Math.round(totalG / pixelCount);
      let b = Math.round(totalB / pixelCount);

      if (palette && palette.length > 0) {
        const matched = nearestColor(r, g, b, palette);
        r = matched.r;
        g = matched.g;
        b = matched.b;
      }

      outCtx.fillStyle = `rgb(${r},${g},${b})`;
      outCtx.fillRect(x, y, blockW, blockH);
    }
  }
}
