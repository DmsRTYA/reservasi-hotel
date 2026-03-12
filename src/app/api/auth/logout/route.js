import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
export async function POST(req) {
  try {
    const token = req.cookies.get('refreshToken')?.value;
    if (token) getDb().prepare('DELETE FROM refresh_tokens WHERE token=?').run(token);
    const res = NextResponse.json({ success: true, message: 'Logout berhasil' });
    res.cookies.set('refreshToken', '', { httpOnly: true, maxAge: 0, path: '/' });
    return res;
  } catch { return NextResponse.json({ success: false, message: 'Kesalahan server' }, { status: 500 }); }
}
