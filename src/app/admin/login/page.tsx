import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Masuk Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; keluar?: string };
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-cream-100 px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/img/logo-jayati-transparent.png"
            alt="Logo CV Semesta Bumi Jayati"
            width={56}
            height={56}
            priority
            className="h-14 w-14 object-contain"
          />
          <h1 className="mt-3 text-xl font-extrabold tracking-tight text-navy-900">
            Panel Admin Jayati Epoxy
          </h1>
          <p className="mt-1 text-sm text-slate-600">Masuk untuk mengelola data prospek.</p>
        </div>

        {searchParams.keluar ? (
          <p
            role="status"
            className="mb-4 rounded-xl border border-leaf-300 bg-leaf-50 px-4 py-3 text-sm font-semibold text-forest-700"
          >
            Anda telah keluar dari sesi.
          </p>
        ) : null}

        <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-card">
          <LoginForm nextPath={searchParams.next} />
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
          Halaman ini tidak diindeks mesin pencari. Jangan bagikan kata sandi Anda.
        </p>
      </div>
    </main>
  );
}
