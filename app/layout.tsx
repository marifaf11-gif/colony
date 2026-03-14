import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://colonyos.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Colony OS — Loi 25 Compliance Revenue Engine',
  description:
    'Autonomous Loi 25 compliance scanning for Montréal businesses. Detect privacy violations, generate AI outreach, and close $299 CAD remediation deals on autopilot.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
