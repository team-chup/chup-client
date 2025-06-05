import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { QueryProvider } from '@/lib/query';
import { AuthProvider } from '@/lib/auth-provider';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "CHUP.today",
  description: "GSM 채용 요청 통합 관리 서비스, CHUP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <QueryProvider>
            {children}
            <Toaster position="bottom-right" expand={true} richColors />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
