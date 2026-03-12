import './globals.css';

export const metadata = {
  title: 'The Grand Mugarsari',
  description: 'Reservasi hotel mewah The Grand Mugarsari. Pengalaman menginap terbaik menanti Anda.',
  icons: { icon: '/bed.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
