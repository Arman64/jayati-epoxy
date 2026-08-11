import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { allSlugs, createPost } from '@/lib/posts';
import { logCmsEvent } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Sesi tidak valid.' }, { status: 401 });

  try {
    const taken = new Set(await allSlugs());
    let slug = 'artikel-baru';
    let n = 1;
    while (taken.has(slug)) slug = `artikel-baru-${++n}`;

    const post = await createPost(
      {
        slug,
        title: 'Artikel baru',
        category: 'Panduan',
        author: user.name,
        reviewer: '',
        readMinutes: 5,
        sections: [{ h2: '', body: [''] }],
        faqs: [],
      },
      { userId: user.id, source: 'manual' },
    );

    await logCmsEvent('post', post.id, 'create', { slug: post.slug }, 'admin', user.id);
    return NextResponse.json({ ok: true, id: post.id }, { status: 201 });
  } catch (err) {
    console.error('[admin/blog POST]', err);
    return NextResponse.json({ ok: false, error: 'Gagal membuat artikel.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
