import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tap-Bro — Tabletop NFC & QR AI Review Assistant',
  description: 'Tap-Bro helps diners turn their dining visits into authentic Google Reviews in seconds using AI.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tap-Bro',
  },
  icons: {
    icon: '/tap-bro-logo.png',
    apple: '/tap-bro-logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0B0C10',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-[100dvh] bg-page text-text-primary antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
