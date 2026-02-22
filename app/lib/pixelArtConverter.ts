import { Color } from "./paletteParser";

/** Minimum average alpha for a block to be rendered (fully transparent blocks are skipped) */
const TRANSPARENCY_THRESHOLD = 10;

export type ColorAlgorithm = "euclidean" | "weighted" | "ciede76";

/** Find the nearest color using squared RGB Euclidean distance */
function nearestColorEuclidean(r: number, g: number, b: number, palette: Color[]): Color {
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

/** Find the nearest color using perceptually-weighted RGB distance */
function nearestColorWeighted(r: number, g: number, b: number, palette: Color[]): Color {
  let best = palette[0];
  let bestDist = Infinity;
  for (const color of palette) {
    const dr = r - color.r;
    const dg = g - color.g;
    const db = b - color.b;
    // Weights derived from human luminance sensitivity (ITU-R BT.709)
    const dist = 0.2126 * dr * dr + 0.7152 * dg * dg + 0.0722 * db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = color;
    }
  }
  return best;
}

/** Convert a linearized sRGB channel value to the CIE XYZ range */
function srgbToLinear(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

/** Convert an sRGB triplet to CIE L*a*b* */
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  // Convert to XYZ (D65 illuminant)
  const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  const y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750) / 1.00000;
  const z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) / 1.08883;

  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(x), fy = f(y), fz = f(z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** Find the nearest color using CIE76 ΔE (Lab color space), given pre-computed palette Lab values */
function nearestColorCIEDE76(
  r: number,
  g: number,
  b: number,
  palette: Color[],
  paletteLab: [number, number, number][]
): Color {
  const [l1, a1, b1] = rgbToLab(r, g, b);
  let best = palette[0];
  let bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const [l2, a2, b2] = paletteLab[i];
    const dl = l1 - l2;
    const da = a1 - a2;
    const db = b1 - b2;
    const dist = dl * dl + da * da + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = palette[i];
    }
  }
  return best;
}

/** Find the nearest color in a palette using the chosen algorithm */
export function nearestColor(
  r: number,
  g: number,
  b: number,
  palette: Color[],
  algorithm: ColorAlgorithm = "euclidean",
  paletteLab?: [number, number, number][]
): Color {
  if (algorithm === "weighted") return nearestColorWeighted(r, g, b, palette);
  if (algorithm === "ciede76") return nearestColorCIEDE76(r, g, b, palette, paletteLab ?? palette.map((c) => rgbToLab(c.r, c.g, c.b)));
  return nearestColorEuclidean(r, g, b, palette);
}

/**
 * Convert an image to pixel art on a canvas.
 * @param sourceCanvas - The source canvas with the original image drawn onto it
 * @param outputCanvas - The destination canvas to draw the pixel art onto
 * @param pixelSize - Size of each "pixel block" in pixels
 * @param palette - Optional color palette to quantize colors to
 * @param algorithm - Color approximation algorithm to use when a palette is provided
 */
export function convertToPixelArt(
  sourceCanvas: HTMLCanvasElement,
  outputCanvas: HTMLCanvasElement,
  pixelSize: number,
  palette: Color[] | null,
  algorithm: ColorAlgorithm = "euclidean"
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

  // Pre-compute Lab values for CIE76 algorithm once, before the pixel loop
  const paletteLab: [number, number, number][] | undefined =
    palette && palette.length > 0 && algorithm === "ciede76"
      ? palette.map((c) => rgbToLab(c.r, c.g, c.b))
      : undefined;

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
        const matched = nearestColor(r, g, b, palette, algorithm, paletteLab);
        r = matched.r;
        g = matched.g;
        b = matched.b;
      }

      outCtx.fillStyle = `rgb(${r},${g},${b})`;
      outCtx.fillRect(x, y, blockW, blockH);
    }
  }
}
