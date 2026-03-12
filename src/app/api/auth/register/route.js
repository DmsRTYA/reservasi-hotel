import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb from '@/lib/db';

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    if (!username || !email || !password)
      return NextResponse.json({ success: false, message: 'Semua field wajib diisi' }, { status: 400 });
    if (username.trim().length < 3)
      return NextResponse.json({ success: false, message: 'Username minimal 3 karakter' }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ success: false, message: 'Password minimal 6 karakter' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ success: false, message: 'Format email tidak valid' }, { status: 400 });

    const db = getDb();
    if (db.prepare('SELECT id FROM users WHERE email=? OR username=?').get(email.toLowerCase(), username.trim()))
      return NextResponse.json({ success: false, message: 'Email atau username sudah terdaftar' }, { status: 409 });

    const hash = await bcrypt.hash(password, 12);
    const r = db.prepare('INSERT INTO users (username,email,password) VALUES(?,?,?)').run(username.trim(), email.toLowerCase(), hash);
    return NextResponse.json({ success: true, message: 'Registrasi berhasil!', data: { id: r.lastInsertRowid, username: username.trim() } }, { status: 201 });
  } catch (e) {
    console.error('[REGISTER]', e);
    return NextResponse.json({ success: false, message: 'Kesalahan server' }, { status: 500 });
  }
}
