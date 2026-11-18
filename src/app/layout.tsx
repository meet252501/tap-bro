import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tap-Bro — Tabletop NFC & QR AI Review Assistant',
  description: 'Tap-Bro helps diners turn their dining visits into authentic Google Reviews in seconds using AI.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-page text-text-primary antialiased selection:bg-amber-400 selection:text-page">
        {children}
      </body>
    </html>
  );
}
