'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HotelNavbar from '@/components/HotelNavbar';
import { ROOM_TYPES, STATUS_OPTIONS, calcHarga, formatRupiah } from '@/lib/constants';
import apiFetch from '@/lib/apiClient';

const EMPTY = { nama_tamu:'',email:'',telepon:'',no_identitas:'',jenis_kamar:'',jumlah_kamar:1,check_in:'',check_out:'',jumlah_tamu:1,status:'Booking',permintaan:'' };

function StatCard({ icon, label, value, gold }) {
  return (
    <div className="rounded-xl p-5 border transition-all hover:border-yellow-700"
      style={{ background: 'rgba(22,34,51,0.8)', borderColor: 'rgba(201,168,76,0.2)' }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold" style={{ color: gold ? '#C9A84C' : '#F5F0E8', fontFamily: 'Playfair Display, serif' }}>{value}</div>
      <div style={{ color: '#B0A898', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function RoomCard({ name, price, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="rounded-xl p-4 text-left transition-all w-full"
      style={{
        background: selected ? 'rgba(201,168,76,0.15)' : 'rgba(30,48,80,0.4)',
        border: `1px solid ${selected ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.15)'}`,
        boxShadow: selected ? '0 0 0 2px rgba(201,168,76,0.25)' : 'none',
      }}>
      <p style={{ color: selected ? '#E8C97A' : '#F5F0E8', fontWeight: 700, fontSize: 13, fontFamily: 'Playfair Display, serif' }}>{name}</p>
      <p style={{ color: '#C9A84C', fontSize: 11, marginTop: 4 }}>{formatRupiah(price)}/malam</p>
    </button>
  );
}

const INPUT_STYLE = {
  width: '100%', background: 'rgba(30,48,80,0.6)', border: '1px solid rgba(201,168,76,0.2)',
  color: '#F5F0E8', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none',
  fontFamily: 'Lato, sans-serif', transition: 'border-color 0.2s',
};
const LABEL_STYLE = { color: '#B0A898', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 8 };

export default function DashboardPage() {
  const router = useRouter();
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);
  const [stats, setStats]   = useState({ total: 0, checkin: 0, booking: 0, revenue: 0 });

  const showToast = useCallback((msg, type='success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiFetch('/api/reservations');
      if (!res) return;
      const d = await res.json();
      if (d.success) {
        const all = d.data;
        setStats({
          total:   all.length,
          checkin: all.filter(r => r.status === 'Check-In').length,
          booking: all.filter(r => r.status === 'Booking').length,
          revenue: all.filter(r => r.status !== 'Booking').reduce((s, r) => s + (r.total_harga||0), 0),
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) { router.replace('/login'); return; }
    fetchStats();
  }, [router, fetchStats]);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); }

  const estimasi = calcHarga(form.jenis_kamar, form.jumlah_kamar, form.check_in, form.check_out);
  const malam = (form.check_in && form.check_out)
    ? Math.max(1, Math.round((new Date(form.check_out) - new Date(form.check_in)) / 86400000))
    : 0;

  function validate() {
    const e = {};
    if (!form.nama_tamu.trim())    e.nama_tamu    = 'Nama tamu wajib diisi';
    if (!form.email.trim())        e.email        = 'Email wajib diisi';
    if (!form.telepon.trim())      e.telepon      = 'Nomor telepon wajib diisi';
    if (!form.no_identitas.trim()) e.no_identitas = 'No. identitas wajib diisi';
    if (!form.jenis_kamar)         e.jenis_kamar  = 'Pilih jenis kamar';
    if (!form.check_in)            e.check_in     = 'Tanggal check-in wajib diisi';
    if (!form.check_out)           e.check_out    = 'Tanggal check-out wajib diisi';
    if (form.check_in && form.check_out && form.check_out <= form.check_in)
      e.check_out = 'Tanggal check-out harus setelah check-in';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/reservations', { method: 'POST', body: JSON.stringify(form) });
      if (!res) return;
      const d = await res.json();
      if (d.success) {
        showToast(d.message);
        setForm(EMPTY);
        fetchStats();
      } else showToast(d.message, 'error');
    } catch { showToast('Tidak dapat terhubung ke server', 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0D1B2A' }}>
      <HotelNavbar />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-slide-up"
          style={toast.type==='error'
            ? { background:'rgba(127,29,29,0.97)', borderColor:'rgba(231,76,60,0.4)', color:'#fca5a5' }
            : { background:'rgba(20,83,45,0.97)', borderColor:'rgba(46,204,113,0.4)', color:'#86efac' }}>
          {toast.type==='error' ? '❌' : '✅'} <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden pt-16"
        style={{ background: 'linear-gradient(160deg, #1E3050 0%, #162233 60%, #0D1B2A 100%)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="absolute inset-0 opacity-60"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center relative">
          <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', marginBottom: 12 }}>✦ SISTEM RESERVASI ✦</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 700, color: '#F5F0E8', lineHeight: 1.2 }}>
            Selamat Datang di{' '}
            <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>The Grand Mugarsari</em>
          </h1>
          <div className="gold-divider" />
          <p style={{ color: '#B0A898', fontSize: 14, fontWeight: 300, letterSpacing: 0.5 }}>
            Lakukan pemesanan kamar dengan mudah, cepat, dan aman. Pengalaman menginap terbaik menanti Anda.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon="📋" label="Total Reservasi" value={stats.total} />
          <StatCard icon="🛎️" label="Tamu Check-In"   value={stats.checkin} />
          <StatCard icon="📅" label="Booking"          value={stats.booking} />
          <StatCard icon="💰" label="Total Pendapatan" value={formatRupiah(stats.revenue)} gold />
        </div>

        {/* Reservation Form */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(22,34,51,0.6)' }}>
          {/* Form header */}
          <div className="px-8 py-5" style={{ background: 'rgba(30,48,80,0.5)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: 22, fontWeight: 700 }}>
              ✦ Formulir Reservasi
            </h2>
            <p style={{ color: '#B0A898', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 }}>LENGKAPI DATA BERIKUT UNTUK MELAKUKAN PEMESANAN</p>
          </div>

          <form onSubmit={onSubmit} className="p-6 sm:p-8">
            {/* Room type cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {Object.entries(ROOM_TYPES).map(([name, price]) => (
                <RoomCard key={name} name={name} price={price}
                  selected={form.jenis_kamar === name}
                  onClick={() => set('jenis_kamar', name)} />
              ))}
            </div>
            {errors.jenis_kamar && <p style={{ color: '#e74c3c', fontSize: 12, marginTop: -16, marginBottom: 16 }}>⚠ {errors.jenis_kamar}</p>}

            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
              <div>
                <label style={LABEL_STYLE}>NAMA LENGKAP TAMU <span style={{ color: '#e74c3c' }}>*</span></label>
                <input value={form.nama_tamu} onChange={e => set('nama_tamu', e.target.value)}
                  placeholder="Masukkan nama lengkap" className="hotel-input"
                  style={{ borderColor: errors.nama_tamu ? 'rgba(231,76,60,0.5)' : undefined }} />
                {errors.nama_tamu && <p style={{ color: '#e74c3c', fontSize: 11, marginTop: 4 }}>{errors.nama_tamu}</p>}
              </div>
              <div>
                <label style={LABEL_STYLE}>ALAMAT EMAIL <span style={{ color: '#e74c3c' }}>*</span></label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="contoh@email.com" className="hotel-input"
                  style={{ borderColor: errors.email ? 'rgba(231,76,60,0.5)' : undefined }} />
                {errors.email && <p style={{ color: '#e74c3c', fontSize: 11, marginTop: 4 }}>{errors.email}</p>}
              </div>
              <div>
                <label style={LABEL_STYLE}>NOMOR TELEPON / WA <span style={{ color: '#e74c3c' }}>*</span></label>
                <input value={form.telepon} onChange={e => set('telepon', e.target.value)}
                  placeholder="+62 8xx-xxxx-xxxx" className="hotel-input"
                  style={{ borderColor: errors.telepon ? 'rgba(231,76,60,0.5)' : undefined }} />
                {errors.telepon && <p style={{ color: '#e74c3c', fontSize: 11, marginTop: 4 }}>{errors.telepon}</p>}
              </div>
              <div>
                <label style={LABEL_STYLE}>NO. KTP / PASPOR <span style={{ color: '#e74c3c' }}>*</span></label>
                <input value={form.no_identitas} onChange={e => set('no_identitas', e.target.value)}
                  placeholder="Nomor identitas resmi" className="hotel-input"
                  style={{ borderColor: errors.no_identitas ? 'rgba(231,76,60,0.5)' : undefined }} />
                <p style={{ color: '#B0A898', fontSize: 10, marginTop: 4 }}>Diperlukan untuk proses check-in</p>
                {errors.no_identitas && <p style={{ color: '#e74c3c', fontSize: 11, marginTop: 2 }}>{errors.no_identitas}</p>}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
              <div>
                <label style={LABEL_STYLE}>JENIS KAMAR <span style={{ color: '#e74c3c' }}>*</span></label>
                <select value={form.jenis_kamar} onChange={e => set('jenis_kamar', e.target.value)}
                  className="hotel-input" style={{ cursor: 'pointer' }}>
                  <option value="">-- Pilih Jenis Kamar --</option>
                  {Object.entries(ROOM_TYPES).map(([name, price]) => (
                    <option key={name} value={name}>{name} — {formatRupiah(price)}/malam</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>JUMLAH KAMAR <span style={{ color: '#e74c3c' }}>*</span></label>
                <input type="number" min={1} max={10} value={form.jumlah_kamar}
                  onChange={e => set('jumlah_kamar', Number(e.target.value))} className="hotel-input" />
              </div>
              <div>
                <label style={LABEL_STYLE}>TANGGAL CHECK-IN <span style={{ color: '#e74c3c' }}>*</span></label>
                <input type="date" value={form.check_in} onChange={e => set('check_in', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} className="hotel-input"
                  style={{ borderColor: errors.check_in ? 'rgba(231,76,60,0.5)' : undefined }} />
                {errors.check_in && <p style={{ color: '#e74c3c', fontSize: 11, marginTop: 4 }}>{errors.check_in}</p>}
              </div>
              <div>
                <label style={LABEL_STYLE}>TANGGAL CHECK-OUT <span style={{ color: '#e74c3c' }}>*</span></label>
                <input type="date" value={form.check_out} onChange={e => set('check_out', e.target.value)}
                  min={form.check_in || new Date().toISOString().split('T')[0]} className="hotel-input"
                  style={{ borderColor: errors.check_out ? 'rgba(231,76,60,0.5)' : undefined }} />
                {errors.check_out && <p style={{ color: '#e74c3c', fontSize: 11, marginTop: 4 }}>{errors.check_out}</p>}
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label style={LABEL_STYLE}>JUMLAH TAMU <span style={{ color: '#e74c3c' }}>*</span></label>
                <input type="number" min={1} max={20} value={form.jumlah_tamu}
                  onChange={e => set('jumlah_tamu', Number(e.target.value))} className="hotel-input" />
              </div>
              <div>
                <label style={LABEL_STYLE}>STATUS PEMESANAN</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="hotel-input" style={{ cursor: 'pointer' }}>
                  {['Booking', 'Dikonfirmasi', 'Check-In', 'Check-Out'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special request */}
            <div className="mb-6">
              <label style={LABEL_STYLE}>PERMINTAAN KHUSUS</label>
              <textarea value={form.permintaan} onChange={e => set('permintaan', e.target.value)}
                rows={3} placeholder="Misalnya: kamar di lantai tinggi, lantai jauh dari lift, kebutuhan khusus, dll."
                className="hotel-input" style={{ resize: 'vertical' }} />
            </div>

            {/* Price estimation */}
            <div className="rounded-xl p-5 mb-6 flex items-center justify-between"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <div>
                <p style={{ color: '#B0A898', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>ESTIMASI TOTAL BIAYA</p>
                {estimasi > 0
                  ? <p style={{ color: '#B0A898', fontSize: 12, marginTop: 2 }}>
                      {form.jenis_kamar} × {form.jumlah_kamar} kamar × {malam} malam
                    </p>
                  : <p style={{ color: '#B0A898', fontSize: 12, marginTop: 2 }}>Pilih kamar dan tanggal terlebih dahulu</p>
                }
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 700 }}>
                {formatRupiah(estimasi)}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-4 rounded-xl text-sm tracking-widest uppercase font-bold">
              {loading ? '⏳ Memproses Reservasi...' : '✦ BUAT RESERVASI SEKARANG'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(201,168,76,0.15)', padding: '24px 16px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontFamily: 'Playfair Display, serif', fontSize: 13 }}>✦ THE GRAND MUGARSARI ✦</p>
      </footer>
    </div>
  );
}
