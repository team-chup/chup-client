import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { QueryProvider } from '@/lib/query';
import "./globals.css";
import { Header } from "@/components/Header";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Next.js Template",
  description: "Next.js template with modern stack",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased`}>
        <QueryProvider>
          <Header />
          {children}
          <Toaster position="top-center" expand={true} richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
