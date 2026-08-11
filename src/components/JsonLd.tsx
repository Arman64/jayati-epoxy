/**
 * Render JSON-LD terkontrol. Hanya dipakai bila konten schema benar-benar
 * tampil di halaman (PRD §12).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify aman: data berasal dari sumber internal, bukan input user.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
