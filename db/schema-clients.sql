-- Client groups: daftar klien per kategori (portofolio)
CREATE TABLE IF NOT EXISTS client_groups (
  id         SERIAL PRIMARY KEY,
  category   TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  clients    JSONB NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data dari content.ts
INSERT INTO client_groups (category, note, clients, sort_order) VALUES
(
  'Dapur SPPG — Jawa Timur & Madura',
  'Satuan Pelayanan Pemenuhan Gizi di Kediri, Nganjuk, Sampang, dan Pamekasan.',
  '["SPPG Ngadiluwih Kediri","SPPG Ngluyu Nganjuk","SPPG Torjun Sampang","SPPG Komis Sampang","SPPG Tanggumong Sampang","SPPG Tambelangan Sampang","SPPG Dalpenang Sampang","SPPG Peltong Pamekasan","SPPG Palengaan Pamekasan","SPPG Kangenan Pamekasan","SPPG Pademawu Pamekasan"]',
  1
),
(
  'Dapur SPPG — Jawa Tengah (Yayasan & Pesantren)',
  'Dapur pemenuhan gizi pada yayasan dan pondok pesantren di berbagai kabupaten Jawa Tengah.',
  '["Yayasan Binaul Akram Wonosobo","Yayasan PP Al Amin Wonosobo","Yayasan Nurul Qur''an Wonosobo","Yayasan Ma''had Al Mubarok Manggisa Wonosobo","Ponpes Fathul Muin Ali Masykur Wonosobo","Yayasan Bahrul Ulum Pati","Yayasan Ya Fatimah Tayu Pati","Yayasan Sirojul Munir Giling Pati","Yayasan Al Hamidiyah Bulumanis Pati","Yayasan Pendidikan Islam Manahijul Pati","Al Huda Mlagen Rembang","Yayasan Maslakul Huda Rembang","Yayasan PP Abdurrahman Kragan Rembang","Yayasan Nahjatus Sholihin Rembang","PPAL Hidayah Tegal","Yayasan Al Mahbub PP Al Adalah Tegal","Yayasan Ell Firdaus Cilacap","Yayasan Haji Abdullah Yaqub Mansur Cilacap","Yayasan Haji Ilyas Hasan Cilacap","Salafiyah Syarbin Hasan Cilacap","Yayasan Nurul Huda Kawunganten Cilacap","PP Bustanul Ulum Brebes","Yayasan Al Fattah Tegalgandu Brebes","Yayasan Al Masykur Semarang","Yayasan Darussalam Bergas Semarang","Yayasan Ahmad Tamin Said Semarang","Yayasan Wakaf Literasi Islam Semarang","Yayasan Pend. Islam & Sosial Al Mustawa Blora","Yayasan PP Roudhotut Tholobien Bangle Sragen","Yayasan Nurul Hikmah Sambungmacan Sragen","Yayasan Mahyajatul Qurro Sragen","Yayasan PP Imam Ruba''i Sragen","Yayasan Baitussalam Kradenan 1 Grobogan","Yayasan Baitussalam Kradenan 3 Grobogan","Yayasan Baitussalam Kradenan 4 Grobogan","Yayasan Darul Qur''an Al Alif Setro Grobogan","Yayasan Darul Qur''an Al Alif Jeketro Grobogan","Yayasan Pend. Islam Nurul Huda Grobogan","Perkumpulan PP Matholiul Anwar Grobogan","Yayasan Manbaul Anwar Nurul Barokah 2 Kudus","Yayasan Darussalam 1969 Kudus","Yayasan Pesantren Ikhlasul Murtaho 2 Wonogiri","Yayasan Darussalam Istiqomah Purbalingga","PP An Nahl El Qosimi 1 Purbalingga","PP Nahjul Hidayah Darussalam Pekalongan","Yayasan PP Ayo Ngaji Kedungkebo Pekalongan","Perkumpulan PP Salaf & Modern Masyithoh Boyolali","Yayasan Al Muttaqin Ngroto Boyolali","Yayasan PP Al Hikmah Krajan Boyolali","Yayasan Miftahul Huda Rawalo Banyumas","Nurul Iman Rawalo Banyumas","Yayasan Sabilul Hidayatur Rohman Banyumas","Yayasan Kader Santri Yaksa Banyumas","Yayasan Al Ponpes Al Masda Banyumas","Yayasan Roudlotut Tholibin Banjarnegara","Yayasan PP Darussalam Plaosan Purworejo","Yayasan PP Hidayatul Mubtadiin Grogol Purworejo","Yayasan Maarif NU Bener Purworejo","Yayasan Pesantren Assholihaat 1 Magelang","Yayasan Api Nailul Muna Magelang","Yayasan Subbanul Wathon 3 Magelang","Ponpes Assalam Tempuran Magelang","Yayasan Al Irsyad Almubarok Demak","Yayasan Miftahul Falah Balong Jepara","Yayasan Haji San Ahmad Kebumen","Yayasan Al Hidayah Prapak Temanggung"]',
  2
),
(
  'Lapangan Olahraga',
  'Pelapisan lantai lapangan olahraga indoor.',
  '["Lapangan Padel Jakarta"]',
  3
)
ON CONFLICT DO NOTHING;
