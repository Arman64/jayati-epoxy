/** Konstanta status artikel — aman diimpor komponen klien. */

export const POST_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'published',
  'rejected',
  'archived',
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Draf',
  pending_review: 'Menunggu Review',
  approved: 'Disetujui',
  published: 'Terbit',
  rejected: 'Dikembalikan',
  archived: 'Diarsipkan',
};

export const POST_STATUS_TONE: Record<PostStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  pending_review: 'bg-amber-50 text-amber-800 border-amber-300',
  approved: 'bg-sky-50 text-sky-800 border-sky-300',
  published: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-50 text-red-700 border-red-300',
  archived: 'bg-slate-100 text-slate-500 border-slate-300',
};
