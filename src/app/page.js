'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function Root() {
  const router = useRouter();
  useEffect(() => { router.replace(localStorage.getItem('accessToken') ? '/dashboard' : '/login'); }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D1B2A' }}>
      <div className="text-center">
        <p style={{ color: '#C9A84C', fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700 }}>The Grand Mugarsari</p>
        <p style={{ color: '#B0A898', fontSize: 13, marginTop: 4 }}>Memuat...</p>
      </div>
    </div>
  );
}
