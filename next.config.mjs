/** @type {import('next').NextConfig} */

// Security headers — PRD A‑14 (diperbarui: CSP + Cross-Origin policies ditambahkan)
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Content-Security-Policy — H-01
  // 'unsafe-inline' diperlukan oleh Next.js App Router untuk hydration inline scripts.
  // Untuk CSP yang lebih ketat, perlu nonce-based setup (future improvement).
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Script: self + GTM + GA + unsafe-inline (Next.js hydration)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com",
      // Style: self + Google Fonts + unsafe-inline (Tailwind/CSS-in-JS)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Img: self + data URIs + semua HTTPS (untuk gambar CDN, OG images)
      "img-src 'self' data: blob: https:",
      // Font: self + Google Fonts CDN
      "font-src 'self' data: https://fonts.gstatic.com",
      // Koneksi API: self + GA endpoint
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://region1.google-analytics.com",
      // Tidak boleh ada frame di luar situs ini
      "frame-src 'none'",
      // Mencegah situs ini di-embed di iframe orang lain (lebih kuat dari X-Frame-Options)
      "frame-ancestors 'none'",
      // Tidak ada plugin Flash/Java
      "object-src 'none'",
      // Mencegah base tag injection
      "base-uri 'self'",
      // Form hanya boleh submit ke self
      "form-action 'self' https://wa.me",
    ].join('; '),
  },
  // Cross-Origin headers — M-03
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups', // 'same-origin-allow-popups' agar WhatsApp popup tidak diblokir
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-site',
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
