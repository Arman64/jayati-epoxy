/**
 * Membaca lebar dan tinggi gambar langsung dari header berkas.
 *
 * Sengaja tanpa pustaka luar: dependensi tambahan hanya menambah risiko, dan
 * yang dibutuhkan hanya PNG, JPEG, dan WebP. Dimensi wajib diketahui agar
 * setiap `<img>` punya width/height dan tidak menimbulkan pergeseran tata
 * letak (PRD §11, CLS ≤ 0,1).
 */

export type ImageSize = { width: number; height: number; mime: string };

function readPng(b: Buffer): ImageSize | null {
  // 89 50 4E 47 0D 0A 1A 0A, lalu chunk IHDR pada offset 16.
  if (b.length < 24) return null;
  if (b[0] !== 0x89 || b[1] !== 0x50 || b[2] !== 0x4e || b[3] !== 0x47) return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), mime: 'image/png' };
}

function readJpeg(b: Buffer): ImageSize | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;

  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = b[i + 1]!;

    // Penanda tanpa payload.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    // Awal data terkompresi — dimensi pasti sudah lewat.
    if (marker === 0xda) break;

    const len = b.readUInt16BE(i + 2);
    // SOF0–SOF15 kecuali DHT(c4), JPG(c8), DAC(cc) memuat dimensi.
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7), mime: 'image/jpeg' };
    }
    i += 2 + len;
  }
  return null;
}

function readWebp(b: Buffer): ImageSize | null {
  if (b.length < 30) return null;
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;

  const format = b.toString('ascii', 12, 16);

  if (format === 'VP8 ') {
    // Bitstream kunci diawali 9D 01 2A.
    const start = 20 + 3;
    if (b[start] !== 0x9d || b[start + 1] !== 0x01 || b[start + 2] !== 0x2a) return null;
    return {
      width: b.readUInt16LE(start + 3) & 0x3fff,
      height: b.readUInt16LE(start + 5) & 0x3fff,
      mime: 'image/webp',
    };
  }

  if (format === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
      mime: 'image/webp',
    };
  }

  if (format === 'VP8X') {
    // Lebar dan tinggi disimpan sebagai nilai 24-bit dikurangi satu.
    const w = b[24]! | (b[25]! << 8) | (b[26]! << 16);
    const h = b[27]! | (b[28]! << 8) | (b[29]! << 16);
    return { width: w + 1, height: h + 1, mime: 'image/webp' };
  }

  return null;
}

/** Mengembalikan null bila berkas bukan gambar yang didukung atau rusak. */
export function imageSize(buf: Buffer): ImageSize | null {
  const size = readPng(buf) ?? readJpeg(buf) ?? readWebp(buf);
  if (!size) return null;
  if (!Number.isFinite(size.width) || !Number.isFinite(size.height)) return null;
  if (size.width <= 0 || size.height <= 0) return null;
  if (size.width > 20000 || size.height > 20000) return null;
  return size;
}
