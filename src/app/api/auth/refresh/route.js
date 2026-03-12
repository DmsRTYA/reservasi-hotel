import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const token = req.cookies.get('refreshToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Refresh token tidak ditemukan' }, { status: 401 });
    let decoded;
    try { decoded = verifyRefreshToken(token); } catch { return NextResponse.json({ success: false, message: 'Token tidak valid' }, { status: 401 }); }
    const db = getDb();
    const stored = db.prepare("SELECT * FROM refresh_tokens WHERE token=? AND expires_at>datetime('now')").get(token);
    if (!stored) return NextResponse.json({ success: false, message: 'Token kadaluarsa' }, { status: 401 });
    const user = db.prepare('SELECT id,username,email FROM users WHERE id=?').get(decoded.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 401 });
    const accessToken = generateAccessToken({ userId: user.id, username: user.username, email: user.email });
    return NextResponse.json({ success: true, data: { accessToken } });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Kesalahan server' }, { status: 500 });
  }
}
