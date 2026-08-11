import Link from 'next/link';

/** Tab navigasi sederhana berbasis tautan, tanpa state klien. */
export function Tabs({
  base,
  tabs,
  active,
  param = 'tab',
}: {
  base: string;
  tabs: Array<{ id: string; label: string }>;
  active: string;
  param?: string;
}) {
  return (
    <nav className="mt-5 flex flex-wrap gap-1 border-b border-navy-900/12" aria-label="Bagian pengaturan">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <Link
            key={t.id}
            href={`${base}?${param}=${t.id}`}
            aria-current={on ? 'page' : undefined}
            className={`-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
              on
                ? 'border-leaf-500 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
