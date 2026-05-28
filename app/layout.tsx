import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CPI Trading Dashboard',
  description: 'Macro economics dashboard — US CPI inflation forecasting and trade signals for US30 and Gold',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
