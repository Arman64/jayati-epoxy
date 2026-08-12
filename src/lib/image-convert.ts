import 'server-only';
import sharp from 'sharp';

/**
 * Konversi gambar unggahan ke AVIF.
 *
 * Kenapa dikonversi saat unggah, bukan dibiarkan ke optimizer Next.js:
 * berkas yang ditulis ke `public/` SETELAH server berjalan tidak dikenali
 * sebagai aset statis sampai server dinyalakan ulang, sehingga foto baru
 * gagal tampil. Dengan menyimpan hasil konversi sendiri dan menyajikannya
 * lewat rute khusus, foto langsung bisa dilihat begitu diunggah.
 *
 * AVIF dipilih karena ukurannya jauh lebih kecil pada kualitas setara —
 * mendukung target LCP ≤ 2,5 detik (PRD §11).
 */

/** Sisi terpanjang maksimum. Foto ponsel modern jauh lebih besar dari kebutuhan web. */
const MAX_DIMENSION = 2000;

/**
 * quality 55 + effort 4 adalah kompromi yang diuji pada foto proyek nyata:
 * hemat ~60% dibanding JPG sumber tanpa artefak yang terlihat pada foto
 * lantai (permukaan luas bergradasi halus adalah kasus terberat untuk AVIF).
 * effort lebih tinggi hanya menambah waktu unggah tanpa hemat berarti.
 */
const AVIF_QUALITY = 55;
const AVIF_EFFORT = 4;

export type ConvertedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  bytes: number;
};

/**
 * Ubah berkas gambar apa pun (JPG/PNG/WebP) menjadi AVIF.
 *
 * `.rotate()` tanpa argumen menerapkan orientasi EXIF lalu membuang metadatanya,
 * sehingga foto dari ponsel tidak tampil terbalik — dan lebar/tinggi yang
 * dicatat sudah sesuai tampilan akhir (penting agar tidak terjadi layout shift).
 *
 * Melempar Error bila berkas bukan gambar yang bisa dibaca; pemanggil wajib
 * menangkapnya dan membalas 422.
 */
export async function toAvif(input: Buffer): Promise<ConvertedImage> {
  const pipeline = sharp(input, { failOn: 'error' })
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true, // gambar kecil tidak diperbesar (jadi buram)
    })
    .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    bytes: data.length,
  };
}
