'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HotelNavbar from '@/components/HotelNavbar';
import StatusBadge from '@/components/StatusBadge';
import { formatRupiah, STATUS_OPTIONS, ROOM_TYPES } from '@/lib/constants';
import apiFetch from '@/lib/apiClient';

export default function DataTamuPage() {
  const router = useRouter();
  const [data,      setData]      = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('all');
  const [deleteModal, setDeleteModal] = useState(null);
  const [delLoading,  setDelLoading]  = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm,  setEditForm]  = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [toast,     setToast]     = useState(null);

  const showToast = useCallback((msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/reservations');
      if (!res) return;
      const d = await res.json();
      if (d.success) { setData(d.data); setFiltered(d.data); }
    } catch { showToast('Gagal memuat data', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) { router.replace('/login'); return; }
    fetchData();
  }, [router, fetchData]);

  useEffect(() => {
    let r = [...data];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x => x.nama_tamu.toLowerCase().includes(q) || x.email.toLowerCase().includes(q) || x.telepon.includes(q) || x.jenis_kamar.toLowerCase().includes(q));
    }
    if (statusF !== 'all') r = r.filter(x => x.status === statusF);
    setFiltered(r);
  }, [search, statusF, data]);

  async function confirmDelete() {
    if (!deleteModal) return;
    setDelLoading(true);
    try {
      const res = await apiFetch(`/api/reservations/${deleteModal.id}`, { method: 'DELETE' });
      if (!res) return;
      const d = await res.json();
      if (d.success) { showToast(d.message); setData(p => p.filter(x => x.id !== deleteModal.id)); }
      else showToast(d.message, 'error');
    } catch { showToast('Gagal menghapus data', 'error'); }
    finally { setDelLoading(false); setDeleteModal(null); }
  }

  function openEdit(row) { setEditForm({ ...row }); setEditModal(row); }
  function setEF(k, v) { setEditForm(p => ({ ...p, [k]: v })); }

  async function saveEdit() {
    setEditLoading(true);
    try {
      const res = await apiFetch(`/api/reservations/${editModal.id}`, { method: 'PUT', body: JSON.stringify(editForm) });
      if (!res) return;
      const d = await res.json();
      if (d.success) {
        showToast(d.message);
        setData(p => p.map(x => x.id === editModal.id ? d.data : x));
        setEditModal(null);
      } else showToast(d.message, 'error');
    } catch { showToast('Gagal menyimpan perubahan', 'error'); }
    finally { setEditLoading(false); }
  }

  const LABEL = { color: '#B0A898', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 6 };
  const IN = { width:'100%',background:'rgba(13,27,42,0.8)',border:'1px solid rgba(201,168,76,0.25)',color:'#F5F0E8',padding:'9px 12px',borderRadius:8,fontSize:13,outline:'none',fontFamily:'Lato,sans-serif' };

  const totalRevenue = data.filter(r => r.status !== 'Booking').reduce((s, r) => s + (r.total_harga||0), 0);

  return (
    <div className="min-h-screen" style={{ background: '#0D1B2A' }}>
      <HotelNavbar />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-slide-up"
          style={toast.type==='error'
            ? { background:'rgba(127,29,29,0.97)',borderColor:'rgba(231,76,60,0.4)',color:'#fca5a5' }
            : { background:'rgba(20,83,45,0.97)',borderColor:'rgba(46,204,113,0.4)',color:'#86efac' }}>
          {toast.type==='error'?'❌':'✅'} <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', paddingTop: 80 }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#162233', border: '1px solid rgba(201,168,76,0.25)' }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(30,48,80,0.6)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: 18, fontWeight: 700 }}>✦ Edit Reservasi</h3>
              <button onClick={() => setEditModal(null)} style={{ color: '#B0A898', fontSize: 18 }}>✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['nama_tamu','Nama Lengkap Tamu','text'],['email','Email','email'],['telepon','Telepon / WA','text'],['no_identitas','No. KTP / Paspor','text']].map(([k,l,t]) => (
                  <div key={k}>
                    <label style={LABEL}>{l}</label>
                    <input type={t} value={editForm[k]||''} onChange={e=>setEF(k,e.target.value)} style={IN} />
                  </div>
                ))}
                <div>
                  <label style={LABEL}>Jenis Kamar</label>
                  <select value={editForm.jenis_kamar||''} onChange={e=>setEF('jenis_kamar',e.target.value)} style={{ ...IN, cursor:'pointer' }}>
                    {Object.keys(ROOM_TYPES).map(n=><option key={n} value={n} style={{background:'#162233'}}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Jumlah Kamar</label>
                  <input type="number" min={1} max={10} value={editForm.jumlah_kamar||1} onChange={e=>setEF('jumlah_kamar',Number(e.target.value))} style={IN} />
                </div>
                <div>
                  <label style={LABEL}>Tanggal Check-In</label>
                  <input type="date" value={editForm.check_in||''} onChange={e=>setEF('check_in',e.target.value)} style={IN} />
                </div>
                <div>
                  <label style={LABEL}>Tanggal Check-Out</label>
                  <input type="date" value={editForm.check_out||''} onChange={e=>setEF('check_out',e.target.value)} style={IN} />
                </div>
                <div>
                  <label style={LABEL}>Jumlah Tamu</label>
                  <input type="number" min={1} max={20} value={editForm.jumlah_tamu||1} onChange={e=>setEF('jumlah_tamu',Number(e.target.value))} style={IN} />
                </div>
                <div>
                  <label style={LABEL}>Status Pemesanan</label>
                  <select value={editForm.status||'Booking'} onChange={e=>setEF('status',e.target.value)} style={{ ...IN, cursor:'pointer' }}>
                    {['Booking','Dikonfirmasi','Check-In','Check-Out'].map(s=><option key={s} value={s} style={{background:'#162233'}}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={LABEL}>Permintaan Khusus</label>
                <textarea value={editForm.permintaan||''} onChange={e=>setEF('permintaan',e.target.value)} rows={2} style={{ ...IN, resize:'vertical' }} />
              </div>
            </div>
            <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}>
              <button onClick={() => setEditModal(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all"
                style={{ borderColor: 'rgba(201,168,76,0.25)', color: '#B0A898' }}>
                Batal
              </button>
              <button onClick={saveEdit} disabled={editLoading}
                className="btn-gold px-6 py-2.5 rounded-xl text-sm tracking-wider">
                {editLoading ? 'Menyimpan...' : '✦ Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-7 shadow-2xl"
            style={{ background: '#162233', border: '1px solid rgba(231,76,60,0.3)' }}>
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🗑️</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: 20, fontWeight: 700 }}>Hapus Reservasi?</h3>
              <p style={{ color: '#B0A898', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
                Anda akan menghapus reservasi a.n. <strong style={{ color: '#F5F0E8' }}>"{deleteModal.nama}"</strong>.
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all"
                style={{ borderColor: 'rgba(201,168,76,0.25)', color: '#B0A898' }}>Batal</button>
              <button onClick={confirmDelete} disabled={delLoading}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: '#c0392b', color: '#fff' }}>
                {delLoading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🗑️'}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-20 pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-4">
          <div>
            <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: 5, textTransform: 'uppercase' }}>✦ MANAJEMEN TAMU</p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: 28, fontWeight: 700, marginTop: 4 }}>Data Tamu &amp; Reservasi</h1>
            <p style={{ color: '#B0A898', fontSize: 13, marginTop: 4 }}>
              Total <span style={{ color: '#C9A84C', fontWeight: 700 }}>{data.length}</span> reservasi terdaftar
              {totalRevenue > 0 && <> · Pendapatan: <span style={{ color: '#C9A84C', fontWeight: 700 }}>{formatRupiah(totalRevenue)}</span></>}
            </p>
          </div>
          <Link href="/dashboard"
            className="btn-gold inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm tracking-widest uppercase"
            style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
            ✦ Tambah Reservasi
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, email, telepon, atau jenis kamar..."
              className="hotel-input pl-10" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="hotel-input" style={{ width: 'auto', minWidth: 180, cursor: 'pointer' }}>
            <option value="all">Semua Status</option>
            {['Booking','Dikonfirmasi','Check-In','Check-Out'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-14 h-14 mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-900/30" />
              <div className="absolute inset-0 rounded-full border-4 border-t-yellow-600 animate-spin" />
            </div>
            <p style={{ color: '#B0A898', fontSize: 13 }}>Memuat data tamu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border" style={{ background: 'rgba(22,34,51,0.5)', borderColor: 'rgba(201,168,76,0.15)' }}>
            <div className="text-6xl mb-4">🏨</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: 20, fontWeight: 700 }}>
              {data.length === 0 ? 'Belum ada reservasi' : 'Tidak ada hasil'}
            </h3>
            <p style={{ color: '#B0A898', fontSize: 13, marginTop: 8 }}>
              {data.length === 0 ? 'Buat reservasi pertama melalui halaman Reservasi.' : 'Coba ubah kata kunci atau filter.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
            <p style={{ color: '#B0A898', fontSize: 12, padding: '10px 16px', background: 'rgba(22,34,51,0.5)', borderBottom: '1px solid rgba(201,168,76,0.1)', textAlign: 'right' }}>
              Menampilkan {filtered.length} dari {data.length} reservasi
            </p>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
              {filtered.map(r => (
                <div key={r.id} className="p-5" style={{ background: 'rgba(22,34,51,0.7)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p style={{ color: '#F5F0E8', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>{r.nama_tamu}</p>
                      <p style={{ color: '#B0A898', fontSize: 12, marginTop: 2 }}>{r.email}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3" style={{ color: '#B0A898' }}>
                    <span>🏨 {r.jenis_kamar} × {r.jumlah_kamar}</span>
                    <span>👥 {r.jumlah_tamu} tamu</span>
                    <span>📅 {r.check_in}</span>
                    <span>📅 {r.check_out}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: 14 }}>{formatRupiah(r.total_harga)}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                        style={{ borderColor: 'rgba(201,168,76,0.3)', color: '#C9A84C', background: 'rgba(201,168,76,0.08)' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => setDeleteModal({ id: r.id, nama: r.nama_tamu })}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                        style={{ borderColor: 'rgba(231,76,60,0.3)', color: '#e74c3c', background: 'rgba(231,76,60,0.08)' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(30,48,80,0.8)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                    {['#','NAMA TAMU','KONTAK','KAMAR','CHECK-IN / OUT','TAMU','STATUS','TOTAL','AKSI'].map(h => (
                      <th key={h} style={{ padding: '14px 14px', textAlign: 'left', color: '#C9A84C', fontSize: 10, letterSpacing: 2, fontFamily: 'Lato, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => (
                    <tr key={r.id}
                      style={{ borderBottom: '1px solid rgba(201,168,76,0.08)', background: idx%2===0 ? 'rgba(22,34,51,0.7)' : 'rgba(16,28,44,0.7)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(30,48,80,0.6)'}
                      onMouseLeave={e => e.currentTarget.style.background=idx%2===0?'rgba(22,34,51,0.7)':'rgba(16,28,44,0.7)'}>
                      <td style={{ padding:'12px 14px', color:'#B0A898', fontSize:12 }}>{idx+1}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <p style={{ color:'#F5F0E8', fontWeight:700, fontFamily:'Playfair Display,serif', fontSize:14 }}>{r.nama_tamu}</p>
                        <p style={{ color:'#B0A898', fontSize:11, marginTop:2 }}>KTP: {r.no_identitas}</p>
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        <p style={{ color:'#F5F0E8', fontSize:12 }}>{r.email}</p>
                        <p style={{ color:'#B0A898', fontSize:11, marginTop:2 }}>{r.telepon}</p>
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        <p style={{ color:'#E8C97A', fontSize:13, fontWeight:700 }}>{r.jenis_kamar}</p>
                        <p style={{ color:'#B0A898', fontSize:11, marginTop:2 }}>{r.jumlah_kamar} kamar</p>
                      </td>
                      <td style={{ padding:'12px 14px', fontSize:12 }}>
                        <p style={{ color:'#F5F0E8' }}>📅 {r.check_in}</p>
                        <p style={{ color:'#B0A898', marginTop:2 }}>📅 {r.check_out}</p>
                      </td>
                      <td style={{ padding:'12px 14px', color:'#F5F0E8', fontSize:13 }}>{r.jumlah_tamu} org</td>
                      <td style={{ padding:'12px 14px' }}><StatusBadge status={r.status} /></td>
                      <td style={{ padding:'12px 14px', color:'#C9A84C', fontWeight:700, fontSize:13, whiteSpace:'nowrap' }}>{formatRupiah(r.total_harga)}</td>
                      <td style={{ padding:'12px 14px' }}>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(r)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                            style={{ borderColor:'rgba(201,168,76,0.3)', color:'#C9A84C', background:'rgba(201,168,76,0.08)', whiteSpace:'nowrap' }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => setDeleteModal({ id: r.id, nama: r.nama_tamu })}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                            style={{ borderColor:'rgba(231,76,60,0.3)', color:'#e74c3c', background:'rgba(231,76,60,0.08)' }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <footer style={{ borderTop:'1px solid rgba(201,168,76,0.15)',padding:'24px 16px',textAlign:'center' }}>
        <p style={{ color:'#C9A84C',fontFamily:'Playfair Display,serif',fontSize:13 }}>✦ THE GRAND MUGARSARI ✦</p>
      </footer>
    </div>
  );
}
