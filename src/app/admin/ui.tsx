import { STATUS_LABEL, type LeadStatus } from '@/lib/leadStatus';

const TONE: Record<LeadStatus, string> = {
  baru: 'bg-leaf-50 text-forest-700 border-leaf-300',
  dihubungi: 'bg-sky-50 text-sky-800 border-sky-200',
  survei: 'bg-violet-50 text-violet-800 border-violet-200',
  penawaran: 'bg-amber-50 text-amber-800 border-amber-200',
  menang: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  kalah: 'bg-slate-100 text-slate-600 border-slate-300',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${TONE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

const JAKARTA = 'Asia/Jakarta';

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: JAKARTA,
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: JAKARTA,
  }).format(new Date(iso));
}

export function formatRupiahShort(n: number): string {
  if (!n) return 'Rp0';
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1).replace('.', ',')} jt`;
  return `Rp${new Intl.NumberFormat('id-ID').format(n)}`;
}

export function formatRupiah(n: number): string {
  return `Rp${new Intl.NumberFormat('id-ID').format(n)}`;
}

/** Label kolom audit dalam bahasa manusia. */
export const FIELD_LABEL: Record<string, string> = {
  status: 'Status',
  assigned_to: 'Ditugaskan ke',
  estimated_value: 'Estimasi nilai',
  follow_up_at: 'Jadwal follow-up',
};
