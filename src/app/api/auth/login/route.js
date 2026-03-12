import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb from '@/lib/db';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ success: false, message: 'Email dan password wajib diisi' }, { status: 400 });

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email=?').get(email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password)))
      return NextResponse.json({ success: false, message: 'Email atau password salah' }, { status: 401 });

    const payload = { userId: user.id, username: user.username, email: user.email };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const exp = new Date(Date.now() + 7*86400*1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id,token,expires_at) VALUES(?,?,?)').run(user.id, refreshToken, exp);

    const res = NextResponse.json({ success: true, message: 'Login berhasil!', data: { accessToken, user: { id: user.id, username: user.username, email: user.email } } });
    res.cookies.set('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV==='production', sameSite: 'strict', maxAge: 7*86400, path: '/' });
    return res;
  } catch (e) {
    console.error('[LOGIN]', e);
    return NextResponse.json({ success: false, message: 'Kesalahan server' }, { status: 500 });
  }
}
