import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getPostById, listRevisions } from '@/lib/posts';
import { getBrief } from '@/lib/mcp';
import { AdminShell } from '../../AdminShell';
import { formatDateTime } from '../../ui';
import { PostEditor } from './PostEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit Artikel' };

export default async function PostEditPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!/^\d+$/.test(params.id)) notFound();

  const post = await getPostById(Number(params.id));
  if (!post) notFound();

  const [revisions, brief] = await Promise.all([
    listRevisions(post.id),
    post.briefId ? getBrief(post.briefId) : Promise.resolve(null),
  ]);

  return (
    <AdminShell user={user} active="/admin/blog">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/admin/blog" className="font-semibold text-forest-700 underline-offset-2 hover:underline">
          ← Kembali ke daftar artikel
        </Link>
      </nav>

      <PostEditor post={post} isOwner={user.role === 'owner'} brief={brief} />

      {revisions.length ? (
        <section className="mt-4 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Riwayat revisi
          </h2>
          <ol className="mt-3 grid gap-2">
            {revisions.map((r) => (
              <li key={r.id} className="border-l-2 border-navy-900/15 pl-3 text-sm">
                <p className="text-navy-900">{r.note ?? 'Perubahan konten'}</p>
                <p className="text-xs text-slate-500">
                  {r.authorName ?? 'Sistem'} · {formatDateTime(r.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </AdminShell>
  );
}
