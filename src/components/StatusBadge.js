import { STATUS_STYLES } from '@/lib/constants';
export default function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES['Booking'];
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text, letterSpacing: 0.5 }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.text }} />
      {status}
    </span>
  );
}
