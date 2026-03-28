import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './global.scss';
import { VariableProvider } from '@/contexts/VariableContext';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { SessionProvider } from 'next-auth/react';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'AutoLaunch - Social Media Management Platform',
  description: 'Schedule posts, analyze performance, and manage your social media presence',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <VariableProvider>
          <LayoutProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </LayoutProvider>
        </VariableProvider>
      </body>
    </html>
  );
}
