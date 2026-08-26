import type { Metadata } from 'next';
import { AppProviders } from '@/store/Provider';

export const metadata: Metadata = {
  title: 'Job Hunt Dashboard',
  description: 'Track your job applications — built with Next.js, MUI, Redux Toolkit, RTK Query, Zustand',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
