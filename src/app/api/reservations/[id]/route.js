import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser, unauth } from '@/lib/auth';
import { calcHarga } from '@/lib/constants';

export async function GET(req, { params }) {
  const user = getAuthUser(req);
  if (!user) return unauth();
  try {
    const r = getDb().prepare('SELECT * FROM reservations WHERE id=? AND user_id=?').get(params.id, user.userId);
    if (!r) return NextResponse.json({ success: false, message: 'Reservasi tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ success: true, data: r });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const user = getAuthUser(req);
  if (!user) return unauth();
  try {
    const db  = getDb();
    const old = db.prepare('SELECT * FROM reservations WHERE id=? AND user_id=?').get(params.id, user.userId);
    if (!old) return NextResponse.json({ success: false, message: 'Reservasi tidak ditemukan' }, { status: 404 });
    const b = await req.json();
    const merged = {
      nama_tamu:    (b.nama_tamu    ?? old.nama_tamu).toString().trim(),
      email:        (b.email        ?? old.email).toString().trim(),
      telepon:      (b.telepon      ?? old.telepon).toString().trim(),
      no_identitas: (b.no_identitas ?? old.no_identitas).toString().trim(),
      jenis_kamar:   b.jenis_kamar  ?? old.jenis_kamar,
      jumlah_kamar: Number(b.jumlah_kamar ?? old.jumlah_kamar),
      check_in:      b.check_in     ?? old.check_in,
      check_out:     b.check_out    ?? old.check_out,
      jumlah_tamu:  Number(b.jumlah_tamu ?? old.jumlah_tamu),
      status:        b.status       ?? old.status,
      permintaan:   (b.permintaan   ?? old.permintaan).toString().trim(),
    };
    merged.total_harga = calcHarga(merged.jenis_kamar, merged.jumlah_kamar, merged.check_in, merged.check_out);
    db.prepare(`
      UPDATE reservations SET
        nama_tamu=?,email=?,telepon=?,no_identitas=?,jenis_kamar=?,jumlah_kamar=?,
        check_in=?,check_out=?,jumlah_tamu=?,status=?,permintaan=?,total_harga=?,
        updated_at=datetime('now')
      WHERE id=? AND user_id=?
    `).run(
      merged.nama_tamu, merged.email, merged.telepon, merged.no_identitas,
      merged.jenis_kamar, merged.jumlah_kamar, merged.check_in, merged.check_out,
      merged.jumlah_tamu, merged.status, merged.permintaan, merged.total_harga,
      params.id, user.userId
    );
    return NextResponse.json({ success: true, message: 'Reservasi berhasil diperbarui!', data: db.prepare('SELECT * FROM reservations WHERE id=?').get(params.id) });
  } catch (e) {
    console.error('[RES PUT]', e);
    return NextResponse.json({ success: false, message: 'Kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const user = getAuthUser(req);
  if (!user) return unauth();
  try {
    const db  = getDb();
    const old = db.prepare('SELECT * FROM reservations WHERE id=? AND user_id=?').get(params.id, user.userId);
    if (!old) return NextResponse.json({ success: false, message: 'Reservasi tidak ditemukan' }, { status: 404 });
    db.prepare('DELETE FROM reservations WHERE id=? AND user_id=?').run(params.id, user.userId);
    return NextResponse.json({ success: true, message: `Reservasi a.n. "${old.nama_tamu}" berhasil dihapus.` });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Kesalahan server' }, { status: 500 });
  }
}
