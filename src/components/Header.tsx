'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { nav, site, type NavItem } from '@/lib/site';
import { waHref, type ContactInfo } from '@/lib/contact';
import { IconChevron, IconClose, IconMenu, IconWhatsApp } from './Icons';
import { track } from '@/lib/analytics';

export function Header({ contact }: { contact: ContactInfo }) {
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href)),
    [pathname],
  );

  const isGroupActive = useCallback(
    (item: NavItem) =>
      item.href ? isActive(item.href) : Boolean(item.children?.some((c) => isActive(c.href))),
    [isActive],
  );

  /* Tutup semua panel saat pindah halaman */
  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
    setOpenMobileGroup(null);
  }, [pathname]);

  /* Buka grup mobile yang sedang aktif, supaya posisi user terlihat */
  useEffect(() => {
    if (!open) return;
    const active = nav.find((item) => item.children?.some((c) => isActive(c.href)));
    if (active) setOpenMobileGroup(active.label);
  }, [open, isActive]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* Esc menutup dropdown desktop + menu mobile */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpenMenu(null);
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* Klik di luar menutup dropdown desktop */
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openMenu]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  /* Jeda singkat agar kursor sempat menyeberang ke panel */
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-shadow ${
        scrolled
          ? 'border-navy-900/10 bg-white/95 shadow-sm backdrop-blur'
          : 'border-transparent bg-white'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${site.brand} — Beranda`}
        >
          <Image
            src="/img/logo-jayati-transparent.png"
            alt={`Logo ${site.legalName}`}
            width={44}
            height={44}
            priority
            className="h-10 w-10 object-contain lg:h-12 lg:w-12"
          />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-extrabold tracking-tight text-forest-700 lg:text-lg">
              JAYATI <span className="text-navy-900">EPOXY</span>
            </span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-leaf-600 lg:text-[10px]">
              Semesta Bumi Jayati
            </span>
          </span>
        </Link>

        <nav ref={navRef} aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {nav.map((item) => {
              const active = isGroupActive(item);

              if (!item.children) {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href!}
                      aria-current={active ? 'page' : undefined}
                      className={`block whitespace-nowrap rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors ${
                        active
                          ? 'bg-leaf-50 text-forest-700'
                          : 'text-slate-700 hover:bg-cream-100 hover:text-forest-700'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              const expanded = openMenu === item.label;

              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenMenu(item.label);
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(expanded ? null : item.label)}
                    className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors ${
                      active || expanded
                        ? 'bg-leaf-50 text-forest-700'
                        : 'text-slate-700 hover:bg-cream-100 hover:text-forest-700'
                    }`}
                  >
                    {item.label}
                    <IconChevron
                      className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expanded ? (
                    <div className="absolute left-0 top-full z-50 pt-2">
                      <ul className="w-[330px] overflow-hidden rounded-xl border border-navy-900/10 bg-white p-1.5 shadow-lg shadow-navy-900/8">
                        {item.children.map((child) => {
                          const childActive = isActive(child.href);
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                aria-current={childActive ? 'page' : undefined}
                                onClick={() => setOpenMenu(null)}
                                className={`block rounded-lg px-3 py-2.5 transition-colors ${
                                  childActive ? 'bg-leaf-50' : 'hover:bg-cream-100'
                                }`}
                              >
                                <span
                                  className={`block text-[13.5px] font-semibold ${
                                    childActive ? 'text-forest-700' : 'text-navy-900'
                                  }`}
                                >
                                  {child.label}
                                </span>
                                <span className="mt-0.5 block text-xs leading-snug text-slate-600">
                                  {child.desc}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={waHref(contact, undefined, 'header')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_click', { cta_position: 'header' })}
            className="btn-primary hidden !px-4 !py-2.5 text-sm xl:inline-flex"
          >
            <IconWhatsApp className="h-4 w-4" />
            Konsultasi Gratis
          </a>
          <Link
            href="/kontak"
            className="btn-navy hidden !px-4 !py-2.5 text-sm sm:inline-flex"
            onClick={() => track('cta_click', { cta_position: 'header', cta: 'penawaran' })}
          >
            Minta Penawaran
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-navy-900/12 text-navy-900 lg:hidden"
          >
            {open ? (
              <IconClose className="h-5 w-5 shrink-0" />
            ) : (
              <IconMenu className="h-5 w-5 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div id="mobile-nav" hidden={!open} className="border-t border-navy-900/10 bg-white lg:hidden">
        <nav aria-label="Navigasi mobile" className="container-page py-3">
          <ul className="grid gap-0.5">
            {nav.map((item) => {
              if (!item.children) {
                const active = isActive(item.href!);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href!}
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-lg px-3 py-3 text-sm font-semibold ${
                        active ? 'bg-leaf-50 text-forest-700' : 'text-slate-700'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              const groupOpen = openMobileGroup === item.label;
              const active = isGroupActive(item);
              const panelId = `mnav-${item.label.toLowerCase().replace(/\s+/g, '-')}`;

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={groupOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenMobileGroup(groupOpen ? null : item.label)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold ${
                      active ? 'bg-leaf-50 text-forest-700' : 'text-slate-700'
                    }`}
                  >
                    {item.label}
                    <IconChevron
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        groupOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <ul
                    id={panelId}
                    className={`mb-1 ml-3 gap-0.5 border-l border-navy-900/10 pl-3 ${
                      groupOpen ? 'grid' : 'hidden'
                    }`}
                  >
                    {item.children.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={childActive ? 'page' : undefined}
                            className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                              childActive ? 'bg-leaf-50 text-forest-700' : 'text-slate-700'
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
            <li className="mt-2 grid gap-2">
              <Link
                href="/kontak"
                onClick={() => track('cta_click', { cta_position: 'mobile_menu', cta: 'penawaran' })}
                className="btn-navy w-full"
              >
                Minta Penawaran
              </Link>
              <a
                href={waHref(contact, undefined, 'mobile-menu')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_click', { cta_position: 'mobile_menu' })}
                className="btn-primary w-full"
              >
                <IconWhatsApp className="h-4 w-4" />
                WhatsApp {contact.whatsappDisplay}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
