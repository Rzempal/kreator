// src/app/layout.tsx v0.002 Root layout dla Kreatora Paneli
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kreator Paneli Tapicerowanych',
  description: 'Zaprojektuj swoj uklad paneli tapicerowanych i otrzymaj natychmiastowa wycene',
  keywords: ['panele tapicerowane', 'kreator', 'wizualizacja', 'wycena'],
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
    <html lang="pl" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
