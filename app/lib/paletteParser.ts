export interface Color {
  r: number;
  g: number;
  b: number;
  name?: string;
}

export interface Palette {
  name: string;
  colors: Color[];
}

/** Parse a GIMP Palette (.gpl) file */
function parseGPL(text: string): Palette {
  const lines = text.split(/\r?\n/);
  const colors: Color[] = [];
  let name = "Imported Palette";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Name:")) {
      name = trimmed.slice(5).trim();
      continue;
    }
    if (trimmed.startsWith("#") || trimmed.startsWith("GIMP") || trimmed === "") {
      continue;
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        const colorName = parts.slice(3).join(" ") || undefined;
        colors.push({ r, g, b, name: colorName });
      }
    }
  }

  return { name, colors };
}

/** Parse a JASC-PAL / RIFF PAL (.pal) file */
function parsePAL(text: string): Palette {
  const lines = text.split(/\r?\n/);
  const colors: Color[] = [];
  let reading = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "JASC-PAL" || trimmed === "0100") continue;
    if (/^\d+$/.test(trimmed) && !reading) {
      reading = true;
      continue;
    }
    if (reading) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 3) {
        const r = parseInt(parts[0], 10);
        const g = parseInt(parts[1], 10);
        const b = parseInt(parts[2], 10);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          colors.push({ r, g, b });
        }
      }
    }
  }

  return { name: "PAL Palette", colors };
}

const ASE_SIGNATURE = 0x41534546; // "ASEF"
const ACT_FILE_SIZE = 772;
const ACT_COUNT_OFFSET = 768;
const MAX_ACT_COLORS = 256;

/** Parse an Adobe Color Table (.act) binary file */
function parseACT(buffer: ArrayBuffer): Palette {
  const data = new Uint8Array(buffer);
  const colors: Color[] = [];
  let count = MAX_ACT_COLORS;
  if (data.length >= ACT_FILE_SIZE) {
    count = (data[ACT_COUNT_OFFSET] << 8) | data[ACT_COUNT_OFFSET + 1];
    if (count === 0 || count > MAX_ACT_COLORS) count = MAX_ACT_COLORS;
  }
  for (let i = 0; i < count && i * 3 + 2 < data.length; i++) {
    colors.push({ r: data[i * 3], g: data[i * 3 + 1], b: data[i * 3 + 2] });
  }
  return { name: "ACT Palette", colors };
}

/** Parse a hex color list (.hex) file */
function parseHEX(text: string): Palette {
  const colors: Color[] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const hex = line.trim().replace(/^#/, "");
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      colors.push({
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      });
    }
  }
  return { name: "HEX Palette", colors };
}

/** Parse an Adobe Swatch Exchange (.ase) binary file */
function parseASE(buffer: ArrayBuffer): Palette {
  const view = new DataView(buffer);
  const colors: Color[] = [];
  let name = "ASE Palette";

  // Check signature "ASEF"
  if (view.getUint32(0) !== ASE_SIGNATURE) {
    throw new Error("Invalid ASE file: missing ASEF signature.");
  }

  let offset = 12; // skip signature (4) + version (4) + num blocks (4)

  while (offset < buffer.byteLength - 2) {
    const blockType = view.getUint16(offset);
    offset += 2;
    if (offset + 4 > buffer.byteLength) break;
    const blockLength = view.getUint32(offset);
    offset += 4;
    const blockEnd = offset + blockLength;

    if (blockType === 0x0001) {
      // Color entry
      // Read name length (uint16), then UTF-16 name, then color model (4 chars), then values
      if (offset + 2 > buffer.byteLength) break;
      const nameLen = view.getUint16(offset);
      offset += 2;
      // skip name characters (nameLen * 2 bytes for UTF-16)
      offset += nameLen * 2;

      // Color model: 4-byte string
      if (offset + 4 > buffer.byteLength) break;
      const model =
        String.fromCharCode(view.getUint8(offset)) +
        String.fromCharCode(view.getUint8(offset + 1)) +
        String.fromCharCode(view.getUint8(offset + 2)) +
        String.fromCharCode(view.getUint8(offset + 3));
      offset += 4;

      if (model === "RGB ") {
        const r = Math.round(view.getFloat32(offset) * 255);
        const g = Math.round(view.getFloat32(offset + 4) * 255);
        const b = Math.round(view.getFloat32(offset + 8) * 255);
        colors.push({ r, g, b });
      } else if (model === "CMYK") {
        const c = view.getFloat32(offset);
        const m = view.getFloat32(offset + 4);
        const y = view.getFloat32(offset + 8);
        const k = view.getFloat32(offset + 12);
        const r = Math.round(255 * (1 - c) * (1 - k));
        const g = Math.round(255 * (1 - m) * (1 - k));
        const b = Math.round(255 * (1 - y) * (1 - k));
        colors.push({ r, g, b });
      }

      offset = blockEnd;
    } else if (blockType === 0x0000) {
      // Group start - read name
      if (offset + 2 <= buffer.byteLength) {
        const nameLen = view.getUint16(offset);
        const chars: string[] = [];
        for (let i = 0; i < nameLen && offset + 2 + i * 2 + 1 < buffer.byteLength; i++) {
          chars.push(String.fromCharCode(view.getUint16(offset + 2 + i * 2)));
        }
        if (chars.length > 0) name = chars.join("").replace(/\0/g, "");
      }
      offset = blockEnd;
    } else {
      offset = blockEnd;
    }

    if (offset >= buffer.byteLength) break;
  }

  return { name, colors };
}

/** Parse a Lospec palette JSON format */
function parseLospecJSON(text: string): Palette {
  const data = JSON.parse(text);
  const colors: Color[] = [];
  const hexList: string[] = data.colors ?? data.palette ?? [];
  for (const hex of hexList) {
    const clean = hex.replace(/^#/, "");
    if (/^[0-9a-fA-F]{6}$/.test(clean)) {
      colors.push({
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
      });
    }
  }
  return { name: data.name ?? "Lospec Palette", colors };
}

export async function parsePaletteFile(file: File): Promise<Palette> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "gpl") {
    const text = await file.text();
    return parseGPL(text);
  }

  if (ext === "pal") {
    const text = await file.text();
    return parsePAL(text);
  }

  if (ext === "act") {
    const buffer = await file.arrayBuffer();
    return parseACT(buffer);
  }

  if (ext === "hex") {
    const text = await file.text();
    return parseHEX(text);
  }

  if (ext === "ase") {
    const buffer = await file.arrayBuffer();
    return parseASE(buffer);
  }

  if (ext === "json") {
    const text = await file.text();
    return parseLospecJSON(text);
  }

  // Fallback: try hex format
  const text = await file.text();
  return parseHEX(text);
}
