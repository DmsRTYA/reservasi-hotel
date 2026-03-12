'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  useEffect(() => { if (localStorage.getItem('accessToken')) router.replace('/dashboard'); }, [router]);
  function onChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); }

  async function onSubmit(e) {
    e.preventDefault();
    const { username, email, password, confirm } = form;
    if (!username || !email || !password || !confirm) { setError('Semua field wajib diisi'); return; }
    if (password !== confirm) { setError('Konfirmasi password tidak cocok'); return; }
    if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.success) { setSuccess('Akun berhasil dibuat! Mengalihkan ke halaman login...'); setTimeout(() => router.push('/login'), 1800); }
      else setError(data.message);
    } catch { setError('Tidak dapat terhubung ke server.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #162233 0%, #0D1B2A 50%, #1E3050 100%)' }}>
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#C9A84C', letterSpacing: 2 }}>
            THE GRAND MUGARSARI
          </h1>
          <p style={{ color: '#B0A898', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginTop: 4 }}>Buat Akun Staff</p>
          <div className="gold-divider" />
        </div>

        <div className="rounded-2xl p-8 border"
          style={{ background: 'rgba(22,34,51,0.95)', borderColor: 'rgba(201,168,76,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl flex items-center gap-3 animate-fade-in"
              style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)' }}>
              <span style={{ color: '#e74c3c' }}>⚠️</span>
              <p style={{ color: '#e74c3c', fontSize: 13 }}>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 p-3.5 rounded-xl flex items-center gap-3 animate-fade-in"
              style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)' }}>
              <span style={{ color: '#2ecc71' }}>✅</span>
              <p style={{ color: '#2ecc71', fontSize: 13 }}>{success}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {[
              { name: 'username', label: 'Username', type: 'text', placeholder: 'Minimal 3 karakter' },
              { name: 'email',    label: 'Alamat Email', type: 'email', placeholder: 'contoh@email.com' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ color: '#B0A898', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }} className="block mb-2">{f.label}</label>
                <input type={f.type} name={f.name} value={form[f.name]} onChange={onChange} placeholder={f.placeholder} className="hotel-input" />
              </div>
            ))}

            <div>
              <label style={{ color: '#B0A898', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }} className="block mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={onChange}
                  placeholder="Minimal 6 karakter" className="hotel-input pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#B0A898' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ color: '#B0A898', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }} className="block mb-2">Konfirmasi Password</label>
              <input type="password" name="confirm" value={form.confirm} onChange={onChange}
                placeholder="Ulangi password" className="hotel-input"
                style={{ borderColor: form.confirm ? (form.password === form.confirm ? 'rgba(46,204,113,0.5)' : 'rgba(231,76,60,0.5)') : undefined }} />
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 rounded-xl text-sm uppercase tracking-widest" style={{ marginTop: 8 }}>
              {loading ? 'Mendaftar...' : 'Buat Akun'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', marginTop: 24, paddingTop: 20, textAlign: 'center' }}>
            <p style={{ color: '#B0A898', fontSize: 13 }}>
              Sudah punya akun?{' '}
              <Link href="/login" style={{ color: '#C9A84C', fontWeight: 700, textDecoration: 'none' }}>Login di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
