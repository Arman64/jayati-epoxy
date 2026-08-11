import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import {
  allSlugs,
  deletePost,
  getPostById,
  setStatus,
  setValidation,
  updatePost,
  validatePost,
  type PostSection,
} from '@/lib/posts';
import { getBrief, logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  action?: string;
  notes?: string;
  data?: {
    slug?: string;
    title?: string;
    description?: string;
    category?: string;
    author?: string;
    reviewer?: string;
    intro?: string;
    readMinutes?: number;
    noindex?: boolean;
    sections?: PostSection[];
    faqs?: Array<{ q: string; a: string }>;
  };
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 });
  }
  const id = Number(params.id);

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const post = await getPostById(id);
  if (!post) return NextResponse.json({ ok: false, error: 'Artikel tidak ditemukan.' }, { status: 404 });

  const action = String(body.action ?? 'save');
  const d = body.data ?? {};

  /* ---- Simpan perubahan konten (untuk semua aksi kecuali murni status) ---- */
  const contentActions = ['save', 'validate', 'submit'];
  if (contentActions.includes(action)) {
    if (d.slug !== undefined && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug)) {
      return NextResponse.json(
        { ok: false, error: 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.' },
        { status: 422 },
      );
    }
    if (d.slug && (await allSlugs(id)).includes(d.slug)) {
      return NextResponse.json({ ok: false, error: 'Slug sudah dipakai artikel lain.' }, { status: 409 });
    }
    if (post.status === 'published' && user.role !== 'owner') {
      return NextResponse.json(
        { ok: false, error: 'Artikel yang sudah terbit hanya dapat diubah pemilik.' },
        { status: 403 },
      );
    }

    await updatePost(
      id,
      {
        slug: d.slug,
        title: d.title,
        description: d.description,
        category: d.category,
        author: d.author,
        reviewer: d.reviewer,
        intro: d.intro,
        readMinutes: d.readMinutes,
        noindex: d.noindex,
        sections: d.sections,
        faqs: d.faqs,
      },
      user.id,
    );
  }

  const fresh = await getPostById(id);
  if (!fresh) return NextResponse.json({ ok: false, error: 'Artikel hilang.' }, { status: 404 });

  const runValidation = async () => {
    const brief = fresh.briefId ? await getBrief(fresh.briefId) : null;
    const result = validatePost(fresh, {
      existingSlugs: await allSlugs(id),
      primaryKeyword: brief?.primaryKeyword,
    });
    await setValidation(id, result);
    return result;
  };

  try {
    switch (action) {
      case 'save':
        await logCmsEvent('post', id, 'update', { slug: fresh.slug }, 'admin', user.id);
        return NextResponse.json({ ok: true, message: 'Draf tersimpan.' });

      case 'validate': {
        const v = await runValidation();
        return NextResponse.json({
          ok: true,
          validation: v,
          message: v.ok ? 'Lolos pemeriksaan.' : `${v.issues.filter((i) => i.level === 'error').length} masalah ditemukan.`,
        });
      }

      case 'submit': {
        const v = await runValidation();
        if (!v.ok) {
          return NextResponse.json({
            ok: false,
            validation: v,
            error: 'Belum bisa diajukan. Perbaiki dulu masalah yang ditandai merah.',
          });
        }
        await setStatus(id, 'pending_review');
        await logCmsEvent('post', id, 'submit_for_review', {}, 'admin', user.id);
        return NextResponse.json({ ok: true, validation: v, message: 'Diajukan untuk review.' });
      }

      case 'approve': {
        if (user.role !== 'owner')
          return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat menyetujui.' }, { status: 403 });
        if (fresh.status !== 'pending_review')
          return NextResponse.json(
            { ok: false, error: `Hanya artikel berstatus "Menunggu Review" yang bisa disetujui.` },
            { status: 409 },
          );
        const v = await runValidation();
        if (!v.ok)
          return NextResponse.json(
            { ok: false, validation: v, error: 'Validasi gagal, tidak dapat disetujui.' },
            { status: 422 },
          );
        await setStatus(id, 'approved', { userId: user.id, notes: null });
        await logCmsEvent('post', id, 'approve', {}, 'admin', user.id);
        return NextResponse.json({ ok: true, validation: v, message: 'Disetujui. Siap diterbitkan.' });
      }

      case 'reject': {
        if (user.role !== 'owner')
          return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat mengembalikan.' }, { status: 403 });
        await setStatus(id, 'rejected', {
          userId: user.id,
          notes: String(body.notes ?? '').slice(0, 1000) || null,
        });
        await logCmsEvent('post', id, 'reject', { notes: body.notes }, 'admin', user.id);
        return NextResponse.json({ ok: true, message: 'Dikembalikan ke penulis.' });
      }

      case 'publish': {
        if (user.role !== 'owner')
          return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat menerbitkan.' }, { status: 403 });
        // Gerbang wajib: harus sudah disetujui manusia.
        if (fresh.status !== 'approved')
          return NextResponse.json(
            { ok: false, error: `Publikasi ditolak. Status "${fresh.status}", wajib "approved".` },
            { status: 409 },
          );
        const v = await runValidation();
        if (!v.ok)
          return NextResponse.json(
            { ok: false, validation: v, error: 'Validasi gagal, tidak dapat diterbitkan.' },
            { status: 422 },
          );
        await setStatus(id, 'published');
        await logCmsEvent('post', id, 'publish', { slug: fresh.slug }, 'admin', user.id);
        return NextResponse.json({ ok: true, validation: v, message: 'Artikel terbit.' });
      }

      case 'unpublish': {
        if (user.role !== 'owner')
          return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat menarik artikel.' }, { status: 403 });
        await setStatus(id, 'draft');
        await logCmsEvent('post', id, 'unpublish', {}, 'admin', user.id);
        return NextResponse.json({ ok: true, message: 'Artikel ditarik dari publikasi.' });
      }

      default:
        return NextResponse.json({ ok: false, error: 'Aksi tidak dikenal.' }, { status: 422 });
    }
  } catch (err) {
    console.error('[admin/blog PATCH]', err);
    return NextResponse.json({ ok: false, error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function DELETE(_r: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });
  if (user.role !== 'owner')
    return NextResponse.json({ ok: false, error: 'Hanya pemilik yang dapat menghapus.' }, { status: 403 });
  if (!/^\d+$/.test(params.id))
    return NextResponse.json({ ok: false, error: 'ID tidak valid.' }, { status: 400 });

  const done = await deletePost(Number(params.id));
  if (!done) return NextResponse.json({ ok: false, error: 'Artikel tidak ditemukan.' }, { status: 404 });
  await logCmsEvent('post', params.id, 'delete', {}, 'admin', user.id);
  return NextResponse.json({ ok: true });
}
