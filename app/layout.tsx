import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PR Forming Manpower Tracker',
  description: 'Daily project manpower tracking for PR Forming'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
