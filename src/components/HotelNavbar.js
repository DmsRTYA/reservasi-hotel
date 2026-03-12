'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function HotelNavbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]     = useState(null);
  const [open, setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('user'))); } catch {}
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  async function logout() {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    localStorage.removeItem('accessToken'); localStorage.removeItem('user');
    router.push('/login');
  }

  const links = [
    { href: '/dashboard',           label: 'RESERVASI' },
    { href: '/dashboard/data-tamu', label: 'DATA TAMU'  },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(13,27,42,0.98)"
          : "linear-gradient(135deg, #0D1B2A, #1E3050)",
        borderBottom: "1px solid rgba(201,168,76,0.25)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.5)" : "none",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/dashboard"
          style={{ textDecoration: "none" }}
          className="flex items-center gap-3"
        >
          <img
            src="/bed.png"
            alt="Logo The Grand Mugarsari"
            style={{ width: 38, height: 38, objectFit: "contain" }}
          />
          <div>
            <p
              style={{
                fontFamily: "Playfair Display, serif",
                color: "#C9A84C",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 2,
                lineHeight: 1.2,
              }}
            >
              ✦ THE GRAND MUGARSARI
            </p>
            <p
              style={{
                color: "#B0A898",
                fontSize: 9,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              HOTEL MEWAH &amp; VIEW ADUHAI
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ textDecoration: "none" }}
              className="px-4 py-2 rounded-md text-xs font-bold tracking-widest transition-all duration-200"
              style={{
                fontFamily: "Lato, sans-serif",
                background: pathname === l.href ? "#C9A84C" : "transparent",
                color: pathname === l.href ? "#0D1B2A" : "#E8C97A",
                border: `1px solid ${pathname === l.href ? "#C9A84C" : "rgba(201,168,76,0.35)"}`,
                letterSpacing: 1.5,
                fontSize: 11,
              }}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <div className="flex items-center gap-3 ml-4">
              <div
                style={{
                  borderLeft: "1px solid rgba(201,168,76,0.2)",
                  paddingLeft: 16,
                }}
              >
                <p style={{ color: "#C9A84C", fontSize: 12, fontWeight: 700 }}>
                  {user.username}
                </p>
                <p style={{ color: "#B0A898", fontSize: 10 }}>Staff</p>
              </div>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-md text-xs font-bold tracking-wider transition-all"
                style={{
                  background: "rgba(231,76,60,0.1)",
                  border: "1px solid rgba(231,76,60,0.3)",
                  color: "#e74c3c",
                  letterSpacing: 1,
                }}
              >
                KELUAR
              </button>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "#C9A84C" }}
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-4 py-4 border-t animate-fade-in"
          style={{
            background: "rgba(13,27,42,0.99)",
            borderColor: "rgba(201,168,76,0.15)",
          }}
        >
          {user && (
            <div
              className="flex items-center gap-3 mb-4 pb-4"
              style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #a8893d)",
                  color: "#0D1B2A",
                }}
              >
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ color: "#C9A84C", fontWeight: 700, fontSize: 13 }}>
                  {user.username}
                </p>
                <p style={{ color: "#B0A898", fontSize: 11 }}>{user.email}</p>
              </div>
            </div>
          )}
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-lg mb-1 text-xs font-bold tracking-widest"
              style={{
                color: pathname === l.href ? "#C9A84C" : "#B0A898",
                background:
                  pathname === l.href ? "rgba(201,168,76,0.1)" : "transparent",
              }}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full mt-2 px-4 py-3 rounded-lg text-xs font-bold tracking-wider text-left"
            style={{ color: "#e74c3c", background: "rgba(231,76,60,0.08)" }}
          >
            KELUAR
          </button>
        </div>
      )}
    </header>
  );
}
