# 🎮 Pixel Art Converter

A web-based tool that converts any image to pixel art entirely in your browser — no uploads to servers, no login required.

## Features

- **Image Upload** — drag-and-drop or click to upload (PNG, JPG, GIF, WebP, BMP, SVG, and more)
- **Palette Support** — optionally load a color palette to quantize colors:
  - GIMP Palette (`.gpl`)
  - JASC-PAL (`.pal`)
  - Adobe Color Table (`.act`)
  - Hex color list (`.hex`)
  - Adobe Swatch Exchange (`.ase`)
  - Lospec JSON (`.json`)
- **Pixel Size Slider** — adjust from 2px (fine detail) to 64px (chunky blocks)
- **Live Preview** — the converted image updates instantly on every change
- **Download** — click the Download button or right-click the canvas to save as PNG
- **Privacy** — all processing happens locally in your browser using the Canvas API

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- HTML5 Canvas API for pixel art conversion

## How It Works

1. The uploaded image is drawn onto an off-screen `<canvas>`.
2. The canvas is divided into blocks of the selected pixel size.
3. Each block's average color is computed.
4. If a palette is loaded, each block color is matched to the nearest palette color using squared Euclidean distance in RGB space.
5. The result is drawn onto a visible canvas for preview and download.
