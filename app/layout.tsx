import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Belanosima } from "next/font/google";
import "./globals.css";

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Belanosima({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Warmi Mind - AI Document Analysis",
  description: "Analyze PDFs with AI-powered summaries in multiple languages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
