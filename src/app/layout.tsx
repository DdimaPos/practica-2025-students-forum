import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/generic/theme-provider';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Peerplex | Students Forum',
  description: 'Forum for students',
  verification: {
    google: 'Y_MDNX56q-y31pq0JJGX860RZHgEQYsEA7_VNV_2r6M',
  },
  robots: 'all',
  category: 'forum',
  generator: 'nextjs',
  openGraph: {
    images: 'opengraph-image.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
