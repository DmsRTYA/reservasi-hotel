import { NextResponse } from 'next/server';
import { verifyAccessToken } from './jwt';

export function getAuthUser(req) {
  const h = req.headers.get('Authorization') || '';
  if (!h.startsWith('Bearer ')) return null;
  try { return verifyAccessToken(h.slice(7)); } catch { return null; }
}

export function unauth(msg = 'Token tidak valid atau kadaluarsa') {
  return NextResponse.json({ success: false, message: msg }, { status: 401 });
}
