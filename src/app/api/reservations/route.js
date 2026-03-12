import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser, unauth } from '@/lib/auth';
import { calcHarga } from '@/lib/constants';

export async function GET(req) {
  const user = getAuthUser(req);
  if (!user) return unauth();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    let query = 'SELECT * FROM reservations WHERE user_id=? ORDER BY created_at DESC';
    const params = [user.userId];
    if (status && status !== 'all') { query = 'SELECT * FROM reservations WHERE user_id=? AND status=? ORDER BY created_at DESC'; params.push(status); }
    const data = getDb().prepare(query).all(...params);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('[RES GET]', e);
    return NextResponse.json({ success: false, message: 'Kesalahan server' }, { status: 500 });
  }
}

export async function POST(req) {
  const user = getAuthUser(req);
  if (!user) return unauth();
  try {
    const b = await req.json();
    const required = ['nama_tamu','email','telepon','no_identitas','jenis_kamar','check_in','check_out'];
    for (const f of required) {
      if (!b[f] || !String(b[f]).trim())
        return NextResponse.json({ success: false, message: `Field ${f} wajib diisi` }, { status: 400 });
    }
    const total = calcHarga(b.jenis_kamar, b.jumlah_kamar || 1, b.check_in, b.check_out);
    const db = getDb();
    const r = db.prepare(`
      INSERT INTO reservations (user_id,nama_tamu,email,telepon,no_identitas,jenis_kamar,jumlah_kamar,check_in,check_out,jumlah_tamu,status,permintaan,total_harga)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      user.userId, b.nama_tamu.trim(), b.email.trim(), b.telepon.trim(), b.no_identitas.trim(),
      b.jenis_kamar, Number(b.jumlah_kamar)||1, b.check_in, b.check_out,
      Number(b.jumlah_tamu)||1, b.status||'Booking', (b.permintaan||'').trim(), total
    );
    const created = db.prepare('SELECT * FROM reservations WHERE id=?').get(r.lastInsertRowid);
    return NextResponse.json({ success: true, message: 'Reservasi berhasil ditambahkan!', data: created }, { status: 201 });
  } catch (e) {
    console.error('[RES POST]', e);
    return NextResponse.json({ success: false, message: 'Kesalahan server' }, { status: 500 });
  }
}
