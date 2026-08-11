import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { countPostsByStatus, listPosts } from '@/lib/posts';
import { POST_STATUSES, POST_STATUS_LABEL, type PostStatus } from '@/lib/postStatus';
import { AdminShell } from '../AdminShell';
import { PostBadge } from './PostBadge';
import { formatDateTime } from '../ui';
import { NewPostButton } from './NewPostButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blog' };

function isStatus(v: string | undefined): v is PostStatus {
  return !!v && (POST_STATUSES as readonly string[]).includes(v);
}

export default async function BlogAdmin({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await requireUser();
  const status = isStatus(searchParams.status) ? searchParams.status : 'semua';
  const [posts, counts] = await Promise.all([listPosts({ status }), countPostsByStatus()]);

  return (
    <AdminShell user={user} active="/admin/blog">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Blog</h1>
          <p className="mt-1 text-sm text-slate-600">
            {counts.total} artikel · {counts.published} terbit · {counts.pending_review} menunggu
            review
          </p>
        </div>
        <NewPostButton />
      </div>

      <nav aria-label="Filter status" className="mt-5 flex flex-wrap gap-1.5">
        <Link
          href="/admin/blog"
          aria-current={status === 'semua' ? 'page' : undefined}
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
            status === 'semua'
              ? 'border-navy-900 bg-navy-900 text-white'
              : 'border-navy-900/15 bg-white text-slate-700 hover:bg-cream-50'
          }`}
        >
          Semua ({counts.total})
        </Link>
        {POST_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/blog?status=${s}`}
            aria-current={status === s ? 'page' : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
              status === s
                ? 'border-navy-900 bg-navy-900 text-white'
                : 'border-navy-900/15 bg-white text-slate-700 hover:bg-cream-50'
            }`}
          >
            {POST_STATUS_LABEL[s]} ({counts[s] ?? 0})
          </Link>
        ))}
      </nav>

      <div className="mt-4 overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-card">
        {posts.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            Tidak ada artikel dengan status ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">Daftar artikel blog</caption>
              <thead className="border-b border-navy-900/10 bg-cream-50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Judul</th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Status</th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Sumber</th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Validasi</th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">Diperbarui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/8">
                {posts.map((p) => {
                  const v = p.validation as { ok?: boolean; issues?: unknown[] };
                  const errCount = Array.isArray(v.issues)
                    ? (v.issues as Array<{ level: string }>).filter((i) => i.level === 'error').length
                    : 0;
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-cream-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/blog/${p.id}`}
                          className="font-bold text-navy-900 underline-offset-2 hover:underline"
                        >
                          {p.title}
                        </Link>
                        <span className="block truncate text-xs text-slate-500">/{p.slug}</span>
                      </td>
                      <td className="px-4 py-3">
                        <PostBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold ${
                            p.source === 'mcp'
                              ? 'bg-violet-50 text-violet-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.source === 'mcp' ? 'MCP' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {v.ok === undefined ? (
                          <span className="text-xs text-slate-400">belum dicek</span>
                        ) : v.ok ? (
                          <span className="text-xs font-bold text-emerald-700">lolos</span>
                        ) : (
                          <span className="text-xs font-bold text-red-700">{errCount} error</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                        {formatDateTime(p.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
