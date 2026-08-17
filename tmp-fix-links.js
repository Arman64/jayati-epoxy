const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  // Post 7: Clean Room - add internal links
  const r7 = await p.query('SELECT intro, sections FROM posts WHERE id=7');
  let intro7 = r7.rows[0].intro;
  let sec7 = typeof r7.rows[0].sections === 'string' ? JSON.parse(r7.rows[0].sections) : r7.rows[0].sections;

  // Add links to intro if not present
  if (!intro7.includes('href=')) {
    intro7 = intro7.replace(
      'Sandwich panel jadi material utama bikin clean room karena bisa kedap, isolasi suhu, dan gampang dibersihkan.',
      'Sandwich panel jadi material utama bikin <a href="/jasa-epoxy-lantai" class="text-forest-700 underline decoration-leaf-400">clean room</a> karena bisa kedap, isolasi suhu, dan gampang dibersihkan.'
    );
  }

  // Add internal links to sections
  for (let i = 0; i < sec7.length; i++) {
    for (let j = 0; j < sec7[i].body.length; j++) {
      let b = sec7[i].body[j];
      if (b.includes('href=')) continue; // already has links

      // Section 1: Fungsi Clean Room
      if (sec7[i].h2 === 'Fungsi Clean Room di Industri') {
        b = b.replace(
          'Tanpa kombinasi yang bener, clean room cuma jadi ruang biasa yang pakai AC mahal.',
          'Tanpa kombinasi yang bener, clean room cuma jadi ruang biasa yang pakai AC mahal. Lihat <a href="/jasa-epoxy-lantai" class="text-forest-700 underline decoration-leaf-400">layanan konstruksi industri kami</a> untuk gambaran lengkap.'
        );
      }

      // Section 2: Jenis Panel
      if (sec7[i].h2 === 'Jenis Sandwich Panel untuk Clean Room') {
        b = b.replace(
          'Untuk ruang yang kontak langsung dengan bahan pangan, stainless steel jadi pilihan utama.',
          'Untuk ruang yang kontak langsung dengan bahan pangan, stainless steel jadi pilihan utama. Baca juga <a href="/blog/epoxy-lantai-pabrik" class="text-forest-700 underline decoration-leaf-400">artikel epoxy lantai pabrik</a> untuk sistem lantai di area produksi.'
        );
      }

      // Section 3: Biaya
      if (sec7[i].h2 === 'Biaya dan Estimasi Pemasangan') {
        b = b.replace(
          'Hubungi kami langsung untuk survei gratis.',
          'Hubungi kami langsung melalui <a href="/kontak" class="text-forest-700 underline decoration-leaf-400">halaman kontak</a> untuk survei gratis.'
        );
        b = b.replace(
          'Semua komponen ini harus bekerja sama',
          'Semua komponen ini harus bekerja sama — cek <a href="/harga-epoxy-lantai" class="text-forest-700 underline decoration-leaf-400">daftar harga epoxy lantai</a> kami.'
        );
      }

      // Section 4: Tips
      if (sec7[i].h2 === 'Tips Perawatan Clean Room') {
        b = b.replace(
          'Untuk tips perawatan lantai epoxy di area clean room, baca artikel.',
          'Untuk tips perawatan lantai epoxy di area clean room, baca <a href="/blog/penyebab-epoxy-mengelupas" class="text-forest-700 underline decoration-leaf-400">artikel penyebab epoxy mengelupas dan cara mencegahnya</a>.'
        );
      }

      sec7[i].body[j] = b;
    }
  }

  await p.query('UPDATE posts SET intro=$1, sections=$2 WHERE id=7', [intro7, JSON.stringify(sec7)]);

  // Verify all posts have links
  for (let pid of [7, 8, 9]) {
    const r = await p.query('SELECT sections FROM posts WHERE id=' + pid);
    let sec = typeof r.rows[0].sections === 'string' ? JSON.parse(r.rows[0].sections) : r.rows[0].sections;
    let linkCount = 0;
    for (const s of sec) {
      for (const b of s.body) {
        if (b.includes('href=')) linkCount++;
      }
    }
    console.log('Post ' + pid + ': ' + linkCount + ' links');
  }

  p.end();
})().catch(e => { console.error('ERR:', e.message); p.end(); });
