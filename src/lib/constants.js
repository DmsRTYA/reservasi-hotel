export const ROOM_TYPES = {
  'Standard':     350000,
  'Superior':     500000,
  'Deluxe':       750000,
  'Junior Suite': 1100000,
  'Suite':        1800000,
  'Presidential': 3500000,
};

export const STATUS_OPTIONS = ['Booking', 'Dikonfirmasi', 'Check-In', 'Check-Out'];

export const STATUS_STYLES = {
  'Booking':      { bg: 'rgba(201,168,76,0.15)',  border: 'rgba(201,168,76,0.4)',  text: '#C9A84C'  },
  'Dikonfirmasi': { bg: 'rgba(52,152,219,0.15)',  border: 'rgba(52,152,219,0.4)',  text: '#3498db'  },
  'Check-In':     { bg: 'rgba(46,204,113,0.15)',  border: 'rgba(46,204,113,0.4)',  text: '#2ecc71'  },
  'Check-Out':    { bg: 'rgba(149,165,166,0.15)', border: 'rgba(149,165,166,0.4)', text: '#95a5a6'  },
};

export function calcHarga(jenis, jumlahKamar, checkIn, checkOut) {
  if (!jenis || !checkIn || !checkOut) return 0;
  const d1 = new Date(checkIn), d2 = new Date(checkOut);
  const malam = Math.max(1, Math.round((d2 - d1) / 86400000));
  return (ROOM_TYPES[jenis] || 0) * jumlahKamar * malam;
}

export function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}
