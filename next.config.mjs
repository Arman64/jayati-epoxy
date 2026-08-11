/** @type {import('next').NextConfig} */

// Security headers — PRD §14
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Admin / preview / thank-you must never be indexed — PRD §12
        source: '/terima-kasih',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  async redirects() {
    // Redirect manager — no loops, no duplicate path (PRD §15)
    return [
      { source: '/jasa-epoxy', destination: '/jasa-epoxy-lantai', permanent: true },
      { source: '/harga', destination: '/harga-epoxy-lantai', permanent: true },
      { source: '/epoxy-rumah', destination: '/epoxy-lantai-rumah', permanent: true },
      { source: '/epoxy-industri', destination: '/epoxy-lantai-industri', permanent: true },
      { source: '/kontak-kami', destination: '/kontak', permanent: true },

      // Slug portofolio contoh yang dihapus setelah data proyek asli masuk.
      { source: '/portofolio/gudang-logistik-sidoarjo', destination: '/portofolio', permanent: true },
      { source: '/portofolio/garasi-rumah-malang', destination: '/portofolio', permanent: true },
      { source: '/portofolio/dapur-produksi-surabaya', destination: '/portofolio', permanent: true },
      { source: '/portofolio/showroom-otomotif-jakarta', destination: '/portofolio', permanent: true },

      // Kota yang tidak lagi punya halaman sendiri — layanan bersifat nasional.
      { source: '/area-layanan/bandung', destination: '/area-layanan', permanent: true },
      { source: '/area-layanan/tangerang', destination: '/area-layanan', permanent: true },
      { source: '/area-layanan/malang', destination: '/area-layanan', permanent: true },
    ];
  },
};

export default nextConfig;
